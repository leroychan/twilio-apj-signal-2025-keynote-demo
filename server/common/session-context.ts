/**
 * @fileoverview
 * This file defines the schema for the Conversation Relay Session Context.
 *
 * Context is structured state that can be used to programmatically configure
 * the LLM.
 *
 * @customize SessionContext needs to be customized for each implementation. This
 * schema is used for demonstration purposes.
 */

import type { VectorSearchResult } from "../agents/recall/types.js";
import type { CallSummary } from "../agents/summary/types.js";
import type { FormNameType, FormRecord_1, FormRecord_2 } from "./forms.js";

export interface SessionContext {
  call: CallDetails;
  company: CompanyDetails;
  demo: DemoDetails;
  form_1: FormRecord_1;
  form_2: FormRecord_2;
  recall: RecallState;
  screenControl: ScreenControlState;
  setup: SetupContext;
  summary: CallSummary;
  underwriter: Record<string, UnderwriterThreads>;
  user: UserRecord;
}

export type SessionContextParams = Omit<SessionContext, "setup">; // params required to initialize context

export interface SessionLogs extends Record<string, DemoLogItem> {}

// the payload that is emitted to the sync event stream when a new session is created
export interface SessionMetaData {
  id: string; // callSid
  callSid: string;
  dateCreated: string;
}

// ========================================
// Twilio Related
// ========================================
export interface CallDetails {
  participantPhone: string; // the phone number of the person being called or calling
  recordingUrl?: string;
  sid: string;

  status:
    | "queued"
    | "ringing"
    | "in-progress"
    | "completed"
    | "busy"
    | "failed"
    | "no-answer";
}

export interface SetupContext {
  accountSid: string;
  applicationSid: string | null;
  callerName: string;
  callSid: string;
  callStatus: string;
  callType: "PSTN";
  direction: "inbound";
  forwardedFrom: string;
  from: string;
  parentCallSid: string;
  sessionId: string;
  to: string;
  type: "setup";
}

// ========================================
// Demo Purposes
// ========================================
export interface CompanyDetails {
  name: string;
  description: string;
}
export interface DemoDetails {
  label?: string;
}

// ========================================
// User Information
// ========================================
export interface UserRecord {
  id: string;
  first_name: string;
  last_name: string;

  email?: string;
  phone: string;
}

// ========================================
// Recall
// ========================================
export interface RecallState {
  items: VectorSearchResult[];
  newIds: string[]; // ids that were first discovered
}

// ========================================
// Underwriter
// ========================================
export interface UnderwriterThreads {
  id: string;
  question: UnderwriterQuestion;
  answer: UnderwriterAnswer;
  status: "initiated" | "processing" | "complete" | "error";
}

export interface UnderwriterQuestion {
  summary: string; // concise summary of the situation
  instructions: string; // an explanation what the underwriter needs to do.
  userId: string;
  formName: string;
}

export interface UnderwriterAnswer {
  answer: string; // short, plain-English explanation or recommendation
  actions: ContractAction[]; // ordered list of tool calls executed
  evidence: EvidenceItem[]; // key datapoints with values and relevance
  next_steps: NextStep[]; // recommended actions for the requesting agent
  other_findings: OtherFindings[];
}

interface ContractAction {
  tool: string; // name of the tool called
  args: Record<string, any>; // arguments passed to the tool
  result_ref: string; // reference ID for the result
}

interface EvidenceItem {
  ref: string; // path to the data in results (e.g., "A1.path.to.field")
  value: any; // the actual value found at the reference
  relevance?: string; // optional explanation of why this evidence matters
}

interface NextStep {
  type: string; // type of next step (e.g., "request_doc", "escalate")
  detail: string; // details about the next step
}

interface OtherFindings {
  type: string;
  description: string; // a description of the finding and why it might be helpful
  data?: object; // optional data, if helpful data was found
}

// ========================================
// Screen Control State
// ========================================
export interface ScreenControlState {
  permission: "not-requested" | "requested" | "approved" | "rejected";
  formPage: FormNameType | undefined;
  scope?: "view_only" | "view_and_control";
  reason?: string;
}

export interface ChangePagePayload {
  id: string;
  formName: FormNameType;
  userId: string;
}

// ========================================
// Underwriter
// ========================================
export type DemoLogItem =
  | UnderwriterToolLog
  | SegmentProfileLog
  | SegmentInteractionLog
  | RecallLog
  | TopicLog;

type WithOptionalParams<T> = Omit<T, "dateCreated" | "callSid"> & {
  dateCreated?: string;
  callSid?: string;
};

export type DemoLogItemParams =
  | WithOptionalParams<UnderwriterToolLog>
  | WithOptionalParams<SegmentProfileLog>
  | WithOptionalParams<SegmentInteractionLog>
  | WithOptionalParams<RecallLog>
  | WithOptionalParams<TopicLog>;

export type DemoLogSource = DemoLogItem["source"];

interface DemoLogBase {
  dateCreated: string;
  id: string;
  callSid: string;
  details: string;
}

export interface UnderwriterToolLog extends DemoLogBase {
  source: "underwriter";
  type: "tool";
  args: object;
  result: object | undefined;
}

export interface SegmentProfileLog extends DemoLogBase {
  source: "segment";
  type: "profile";
  profile: UserRecord;
}

export interface SegmentInteractionLog extends DemoLogBase {
  source: "segment";
  type: "interactions";
  interactions: SegmentInteraction[];
}

export interface SegmentInteraction {
  event: string;
  timestamp: string; // iso string
  properties: { [key: string]: any };
}

export interface RecallLog extends DemoLogBase {
  source: "recall";
  result: VectorSearchResult;
}

export interface TopicLog extends DemoLogBase {
  source: "summary";
  topic: string;
  articles: string[]; // knowledge articles
}
