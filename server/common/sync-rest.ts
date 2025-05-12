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
import {
  FORM_NAME_1,
  FORM_NAME_2,
  FormRecord,
  makeForm1,
  makeForm2,
} from "./forms.js";
import { users } from "./mock-database/users.js";
import {
  ChangePagePayload,
  DemoLogItem,
  DemoLogItemParams,
} from "./session-context.js";
import { isSyncItemAlreadyCreated, isSyncNotFound } from "./sync-errors.js";
import {
  CALL_INITIATING_STREAM,
  CHANGE_PAGE_STREAM,
  makeContextMapName,
  makeFormItemName,
  makeLogMapName,
  makeUserDataMapName,
  makeUserRecordMapItemName,
} from "./sync-ids.js";
import type { TwilioCallWebhookPayload } from "./twilio-types.js";

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

export async function checkMakeUserSyncObjects(userId: string) {
  const uniqueName = makeUserDataMapName(userId);

  const title = `user setup ${userId}\t`;

  let isMapCreated = false;
  try {
    console.log(`${title} sync map check: starting`);
    if (!userId) throw Error(`userId is not defined`);
    await sync.syncMaps(uniqueName).fetch(); // throws 404 if not found
    isMapCreated = true;
    console.log(`${title} sync map check: found`);
  } catch (error) {
    if (isSyncNotFound(error)) {
      console.log(`${title} sync map check: not found`);

      isMapCreated = false;
    } else {
      console.error(`Error fetching sync user map`);
      throw error;
    }
  }

  if (!isMapCreated) {
    console.log(`${title} create sync map: starting`);
    await sync.syncMaps.create({ uniqueName });
    console.log(`${title} create sync map: success`);
  }

  let isForm1Created = false;
  try {
    console.log(`${title} form1 map item check: starting`);

    await sync
      .syncMaps(uniqueName)
      .syncMapItems(makeFormItemName(userId, FORM_NAME_1))
      .fetch(); // throws 404 if not found
    isForm1Created = true;
    console.log(`${title} form1 map item check: found`);
  } catch (error) {
    if (isSyncNotFound(error)) {
      console.log(`${title} form1 map item check: not found`);
      isForm1Created = false;
    } else {
      console.error(`Error fetching sync form`);
      throw error;
    }
  }

  const user = users.find((user) => user.id === userId);
  if (!user) throw Error(`User not found. Id: ${userId}`);

  if (!isForm1Created) {
    console.log(`${title} creating form1 map item: starting`);
    const form = makeForm1(user);
    await sync.syncMaps(uniqueName).syncMapItems.create({
      key: form.id,
      data: form,
    });
    console.log(`${title} creating form1 map item: success`);
  }

  let isForm2Created = false;
  try {
    console.log(`${title} form2 map item check: starting`);

    await sync
      .syncMaps(uniqueName)
      .syncMapItems(makeFormItemName(userId, FORM_NAME_2))
      .fetch(); // throws 404 if not found
    isForm2Created = true;
    console.log(`${title} form2 map item check: found`);
  } catch (error) {
    if (isSyncNotFound(error)) {
      console.log(`${title} form2 map item check: not found`);
      isForm2Created = false;
    } else {
      console.error(`Error fetching sync form`);
      throw error;
    }
  }

  if (!isForm2Created) {
    console.log(`${title} creating form2 map item: starting`);
    const form = makeForm2(user);
    await sync.syncMaps(uniqueName).syncMapItems.create({
      key: form.id,
      data: form,
    });
    console.log(`${title} creating form2 map item: success`);
  }

  let isRecordCreated = false;
  const userRecordItemName = makeUserRecordMapItemName(userId);
  try {
    console.log(`${title} user record map item check: starting`);

    await sync.syncMaps(uniqueName).syncMapItems(userRecordItemName).fetch(); // throws 404 if not found
    isRecordCreated = true;
    console.log(`${title} user record map item check: found`);
  } catch (error) {
    if (isSyncNotFound(error)) {
      console.log(`${title} user record map item check: not found`);
      isRecordCreated = false;
    } else {
      console.error(`Error fetching sync record`);
      throw error;
    }
  }

  if (!isRecordCreated) {
    console.log(`${title} created user record map item: starting`);
    const user = users.find((user) => user.id === userId);
    if (!user) throw Error("cannot find user");
    await sync.syncMaps(uniqueName).syncMapItems.create({
      key: userRecordItemName,
      data: user,
    });
    console.log(`${title} created user record map item: success`);
  }
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
    }
  }
}
