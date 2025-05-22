import { nanoid } from "nanoid";
import PQueue from "p-queue";
import twilio from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_SYNC_SVC_SID,
} from "../env.js";
import { getActiveCallSid } from "./cache.js";
import { FormRecord } from "./forms.js";
import {
  ChangePagePayload,
  DemoLogItem,
  DemoLogItemParams,
  IncomingSMSStreamMsg,
} from "./session-context.js";
import { isSyncItemAlreadyCreated } from "./sync-errors.js";
import {
  CALL_INITIATING_STREAM,
  CHANGE_PAGE_STREAM,
  INCOMING_SMS_STREAM,
  makeContextMapName,
  makeFormItemName,
  makeLogMapName,
  makeUserDataMapName,
} from "./sync-ids.js";
import type { TwilioCallWebhookPayload } from "./twilio-types.js";
import { WebsocketLogger } from "../websocket-server/logger.js";

const client = twilio(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});

const sync = client.sync.v1.services(TWILIO_SYNC_SVC_SID);

/**
 * Sends a Sync Stream message to notify an incoming-call webhook has
 * been received
 */
export async function sendInitiatingCallStreamMessage(
  data: TwilioCallWebhookPayload,
) {
  return await sync
    .syncStreams(CALL_INITIATING_STREAM)
    .streamMessages.create({ data });
}

/**
 * Updates the status of a Twilio Sync Map Item that holds the "call" details.
 *
 * This function fetches the current call details from a Twilio Sync Map, preserves all existing call data, and updates only the status field.
 * Each call has its own dedicated Sync Map identified by the callSid
 *
 * @param {string} callSid - The unique identifier of the Twilio call to update
 * @param {string} status - The new status for the call
 */
export async function updateCallStatus(
  callSid: string,
  status:
    | "queued"
    | "ringing"
    | "in-progress"
    | "completed"
    | "busy"
    | "failed"
    | "no-answer",
) {
  const syncMapItemApi = sync
    .syncMaps(makeContextMapName(callSid))
    .syncMapItems("call");

  const oldData = await syncMapItemApi.fetch().then((res) => res.data);

  const data = { ...oldData, status };

  return await syncMapItemApi.update({ data });
}

// ========================================
// User Forms
// ========================================
export async function fetchUserForm<T extends FormRecord>(
  userId: string,
  formName: FormRecord["formName"],
) {
  const uniqueMapName = makeUserDataMapName(userId);
  const uniqueMapItemName = makeFormItemName(userId, formName);

  return await sync
    .syncMaps(uniqueMapName)
    .syncMapItems(uniqueMapItemName)
    .fetch()
    .then((res) => res.data as unknown as T);
}

export async function updateForm(
  userId: string,
  formName: FormRecord["formName"],
  form: FormRecord,
) {
  const uniqueMapName = makeUserDataMapName(userId);
  const uniqueMapItemName = makeFormItemName(userId, formName);

  const current = await sync
    .syncMaps(uniqueMapName)
    .syncMapItems(uniqueMapItemName)
    .fetch()
    .then((res) => res.data);

  return await sync
    .syncMaps(uniqueMapName)
    .syncMapItems(uniqueMapItemName)
    .update({ data: { ...current, ...form } });
}

// ========================================
// Page Change
// ========================================

export async function sendPageChange(
  data: Omit<ChangePagePayload, "id"> & { id?: string },
) {
  return sync
    .syncStreams(CHANGE_PAGE_STREAM)
    .streamMessages.create({ data: { id: nanoid(), ...data } });
}

// ========================================
// Demo Event Logs
// ========================================
const eventLogQueue = new PQueue({ concurrency: 1 });

export const sendDemoLog = async (params: DemoLogItemParams) =>
  eventLogQueue.add(async () => sendDemoLogHandler(params));

async function sendDemoLogHandler(params: DemoLogItemParams) {
  let callSid = params.callSid ?? getActiveCallSid();
  if (!callSid) {
    callSid = "CA00000000000000000000000000000000";
    console.warn("sync", "no callSid available in sendDemoLog");
  }

  const item = {
    dateCreated: new Date().toISOString(),
    ...params,
    callSid,
  } as DemoLogItem;
  const uniqueMapName = makeLogMapName(callSid);

  try {
    await sync
      .syncMaps(uniqueMapName)
      .syncMapItems.create({ key: item.id, data: item });
  } catch (error) {
    if (isSyncItemAlreadyCreated(error)) {
      const current = await sync
        .syncMaps(uniqueMapName)
        .syncMapItems(item.id)
        .fetch()
        .then((res) => res.data as unknown as DemoLogItem);

      await sync
        .syncMaps(uniqueMapName)
        .syncMapItems(item.id)
        .update({ data: { ...current, ...item } });

      return;
    } else {
      console.warn("failed to send demo log", JSON.stringify(params));
    }
  }
}

// ========================================
// SMS Stream
// ========================================
export async function sendIncomingSMSStreamMsg(data: IncomingSMSStreamMsg) {
  try {
    await sync.syncStreams(INCOMING_SMS_STREAM).streamMessages.create({ data });
  } catch (error) {
    console.warn(
      "incoming SMS received, but failed to emit Sync Event. data: ",
      JSON.stringify(data),
      "error\n",
      error,
    );
  }
}
