import { type FormNameType } from "./forms.js";

// ========================================
// Client Identities
// ========================================
export function makeUISyncIdentity(id: string) {
  return `ui-${id}`;
}
export function isUISyncIdentity(id: string) {
  return /^ui-/i.test(id);
}

export function makeServerSyncIdentity(id: string) {
  return `server-${id}`;
}
export function isServerSyncIdentity(id: string) {
  return /^server-/i.test(id);
}

// ========================================
// Call Specific Sync Objects
// ========================================
const callSidRe = /CA[a-f0-9]{32}/;
export function parseCallSid(idOrSid: string) {
  const match = idOrSid.match(callSidRe);
  if (!match) throw Error(`Unable to parse callSid from ${idOrSid}`);
  return match[0];
}

// each session's turns are stored in their own map
export function makeContextMapName(callSid: string) {
  const sid = parseCallSid(callSid);
  return `context-${sid}`;
}
export function isContextMapName(id: string) {
  return /^context-CA[a-f0-9]{32}$/.test(id);
}

// each session's turns are stored in their own map
export function makeTurnMapName(callSid: string) {
  const sid = parseCallSid(callSid);
  return `turns-${sid}`;
}
export function isTurnMapName(id: string) {
  return /^turns-CA[a-f0-9]{32}$/.test(id);
}

// session logs power the UI, mostly. they are stored in a separate sync map because there can be many of them
export function makeLogMapName(callSid: string) {
  const sid = parseCallSid(callSid);
  return `logs-${sid}`;
}
export function isLogMapName(id: string) {
  return /^logs-CA[a-f0-9]{32}$/.test(id);
}

export const CALL_CONNECTED_STREAM = "call-connected"; // stream that emits events when ConversationRelay websocket has been properly connected
export const CALL_INITIATING_STREAM = "call-initiating";
export const CHANGE_PAGE_STREAM = "change-page";
export const INCOMING_SMS_STREAM = "incoming-sms";

// ========================================
// User Specific Sync Objects
// ========================================
export function makeUserDataMapName(userId: string) {
  return `user-${userId}`;
}
export function isUserDataMapName(id: string) {
  return /^user-/i.test(id);
}
export function parseUserId(id: string) {
  const match = id.match(/^user-(.+)$/i);
  if (!match || !match[1]) throw Error(`Invalid userId, cannot parse: ${id}`);
  return match[1];
}
export function makeFormItemName(userId: string, formName: FormNameType) {
  return `${userId}-${formName}`;
}

export function makeUserRecordMapItemName(userId: string) {
  return `record-${userId}`;
}
