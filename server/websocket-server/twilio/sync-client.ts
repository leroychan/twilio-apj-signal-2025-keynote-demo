import { nanoid } from "nanoid";
import Twilio from "twilio";
import { SyncClient } from "twilio-sync";
import {
  CALL_INITIATING_STREAM,
  makeContextMapName,
  makeServerSyncIdentity,
  makeTurnMapName,
} from "../../common/sync-ids.js";
import { TwilioCallWebhookPayload } from "../../common/twilio-types.js";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_SYNC_SVC_SID,
} from "../../env.js";
import { getMakeWebsocketLogger } from "../logger.js";

/**
 * @customize this file is shared across the websocket and webhook servers. this would need to be refactored if the application was deployed separately.
 */

// Cache holds sync clients between call initiation, which occurs in a webhook or rest API request, and the websocket initiliazation.
// note: To prevent memory leaks, the sync client is removed from the cache after it is retrieved the first time and a timeout is set to remove it if it hasn't been accessed w/in a certain time.
const tempSyncClientCache = new Map<
  string,
  { syncPromise: Promise<SyncClient>; timeout: NodeJS.Timeout }
>();

/**
 * Retrieves and removes a Sync client from the temporary cache.
 * @param callSid - The unique identifier for the call session
 * @returns The cached Sync client
 * @throws {Error} If no Sync client is found for the given callSid
 */
export function getSyncClientPromise(callSid: string) {
  const log = getMakeWebsocketLogger(callSid);

  const entry = tempSyncClientCache.get(callSid);
  if (!entry) {
    const error = `No sync client found for ${callSid}.`;
    log.error("sync-client", error);
    throw new Error(error);
  }

  clearTimeout(entry.timeout);
  tempSyncClientCache.delete(callSid);

  return entry.syncPromise;
}

/**
 * Creates and initializes a new Sync client with automatic token management.
 * Waits for the client to establish a connection before resolving.
 *
 * @param clientId - Typically the callSid, but sometimes a discrete name
 * @returns A Promise that resolves to a connected Sync client
 * @throws {Error} If connection is denied or encounters an error
 *
 * @remarks
 * The client includes automatic token refresh handling and will:
 * - Update the token when it's about to expire
 * - Attempt token refresh when expired
 * - Log all connection state changes and errors
 */

async function createSyncClient(callSid: string): Promise<SyncClient> {
  const log = getMakeWebsocketLogger(callSid);
  const getSyncToken = () => createSyncToken(makeServerSyncIdentity(callSid));

  return new Promise((resolve, reject) => {
    let isResolved = false;
    const sync = new SyncClient(getSyncToken());

    // Error handling
    sync.on("connectionError", (error) => {
      log.error(
        "sync-client",
        `sync client connection error ${callSid}`,
        error,
      );
      if (!isResolved) {
        reject(error); // Reject with the error instead of the sync client
      }
    });

    // Token management
    sync.on("tokenAboutToExpire", () => sync.updateToken(getSyncToken()));
    sync.on("tokenExpired", () => {
      log.warn("sync-client", `sync token expired ${callSid}`);
      sync.updateToken(getSyncToken());
    });

    sync.on("connectionStateChanged", (connectionState) => {
      switch (connectionState) {
        case "connecting":
          return;
        case "connected":
          log.info("sync-client", `sync client initialized for ${callSid}`);
          isResolved = true;
          resolve(sync);
          return;

        case "denied":
        case "disconnected":
        case "error":
        case "unknown":
          const error = new Error(`Sync client connection ${connectionState}`);
          log.error(
            "sync",
            `sync client connection ${connectionState}, ${callSid}`,
          );
          if (!isResolved) reject(error);
      }
    });
  });
}

// ========================================
// Token
// ========================================
function createSyncToken(identity: string) {
  const AccessToken = Twilio.jwt.AccessToken;

  const token = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_SECRET,
    { identity },
  );

  token.addGrant(
    new AccessToken.SyncGrant({ serviceSid: TWILIO_SYNC_SVC_SID }),
  );

  return token.toJwt();
}

// ========================================
// Global Sync Listeners
// ========================================

export async function listenForIncomingCalls() {
  return new Promise((resolve) => {
    const id = nanoid();
    const serverId = `conversation-relay-websocket-server-${id}`;
    const getSyncToken = () => createSyncToken(serverId);
    const sync = new SyncClient(getSyncToken());

    // ========================================
    // Initialize Connection
    // ========================================
    sync.on("connectionError", (error) => {
      console.error(`connectionError on global sync client`, error);
    });

    // Token management
    sync.on("tokenAboutToExpire", () => sync.updateToken(getSyncToken()));
    sync.on("tokenExpired", () => {
      console.warn(`global sync token expired ${id}`);
      sync.updateToken(getSyncToken());
    });

    sync.on("connectionStateChanged", (connectionState) => {
      switch (connectionState) {
        case "connecting":
          console.log(`global sync client (${id}) ${connectionState}`);
          break;

        case "connected":
          console.log(`global sync client (${id}) ${connectionState}`);
          resolve(null);

          break;

        case "denied":
        case "disconnected":
        case "error":
        case "unknown":
          console.error(`sync client connection ${connectionState}, ${id}`);
          resolve(null);
      }
    });

    sync.stream(CALL_INITIATING_STREAM).then((stream) => {
      stream.on("messagePublished", (ev) => {
        const data = ev.message.data as TwilioCallWebhookPayload;
        console.log(`warming up sync websocket client for ${data.CallSid}`);
        warmUpSyncSession(data.CallSid);
      });
    });
  });
}

/**
 * Sets up a complete Sync session for a call, including the client and data structures.
 * Creates a Sync client and initializes required map containers for the call session.
 * The client is temporarily cached and will be cleaned up if not retrieved within 5 minutes.
 *
 * @param callSid - The unique identifier for the call session
 * @returns A connected Sync client ready for use
 * @throws {Error} If client connection fails or map creation fails
 */

async function makeSyncPromise(callSid: string) {
  const sync = await createSyncClient(callSid); // initialize client and wait for connection

  await Promise.all([
    sync.map(makeContextMapName(callSid)), // create sync records for call
    sync.map(makeTurnMapName(callSid)),
  ]);

  return sync;
}

export async function warmUpSyncSession(callSid: string) {
  const log = getMakeWebsocketLogger(callSid);

  const syncPromise = makeSyncPromise(callSid);

  const timeout = setTimeout(async () => {
    // delete unaccessed sync clients after 5 minutes to avoid memory leaks
    const entry = tempSyncClientCache.get(callSid);
    const sync = await entry?.syncPromise;
    if (!sync) return;

    sync.removeAllListeners();
    sync.shutdown();

    tempSyncClientCache.delete(callSid);
    log.warn("sync-client", `cleaned up unused sync client for ${callSid}`);
  }, 5 * 60 * 1000);

  tempSyncClientCache.set(callSid, { syncPromise, timeout });

  return syncPromise;
}
