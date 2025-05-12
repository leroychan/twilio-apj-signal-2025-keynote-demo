export type TurnRecord =
  | BotDTMFTurn
  | BotTextTurn
  | BotToolTurn
  | HumanDTMFTurn
  | HumanTextTurn
  | SystemTurn;

interface TurnRecordBase {
  callSid: string;
  createdAt: string; // iso string
  id: string;
  metadata?: { [key: string]: any }; // arbitrary JSON for implementation specific details
  order: number; // order is a non-sequential incrementor. Each turn is only gauranteed to have an order value greater than the previous. In other words, order is not always exactly +1 greater than the previous.
  version: number;
}

// ========================================
// Bot Turns
// ========================================
export type BotTurn = BotDTMFTurn | BotTextTurn | BotToolTurn;
export type BotTurnParams =
  | BotDTMFTurnParams
  | BotTextTurnParams
  | BotToolTurnParams;

type BotTurnStatus = "streaming" | "complete" | "interrupted";

// represents DTMF tones from the bot
export interface BotDTMFTurn extends TurnRecordBase {
  content: string;
  responseId: string;
  role: "bot";
  status: BotTurnStatus;
  type: "dtmf";
}

export type BotDTMFTurnParams = Omit<
  BotDTMFTurn,
  "callSid" | "createdAt" | "id" | "order" | "role" | "type" | "version"
> & { id?: string };

// represents a text from LLM that will be spoken
export interface BotTextTurn extends TurnRecordBase {
  content: string;
  spoken: string;
  responseId: string;
  role: "bot";
  status: BotTurnStatus;
  type: "text";
}

export type BotTextTurnParams = Omit<
  BotDTMFTurn,
  | "callSid"
  | "createdAt"
  | "id"
  | "order"
  | "role"
  | "spoken"
  | "type"
  | "version"
> & { id?: string };

// represents the LLM requesting a FN tool be executed
// note: the results are stored on the toolcall and not a separate item like some LLM APIs, such as OpenAI
export interface BotToolTurn extends TurnRecordBase {
  responseId: string;
  role: "bot";
  status: BotTurnStatus;
  tool_calls: StoreToolCall[];
  type: "tool";
}

export type BotToolTurnParams = Omit<
  BotToolTurn,
  "callSid" | "createdAt" | "id" | "order" | "role" | "type" | "version"
> & { id?: string };

export interface StoreToolCall {
  function: { name: string; arguments: any };
  id: string;
  index: number;
  result?: object;
  type: "function";

  beginAt?: string; // iso
  endAt?: string; // iso
}

// ========================================
// Human Turns
// ========================================
export type HumanTurn = HumanDTMFTurn | HumanTextTurn;
export type HumanTurnParams = HumanDTMFTurnParams | HumanTextTurnParams;

export interface HumanDTMFTurn extends TurnRecordBase {
  content: string;
  role: "human";
  type: "dtmf";
}

export type HumanDTMFTurnParams = Omit<
  HumanDTMFTurn,
  "callSid" | "createdAt" | "id" | "order" | "role" | "type" | "version"
> & { id?: string };

export interface HumanTextTurn extends TurnRecordBase {
  content: string;
  role: "human";
  type: "text";
}

export type HumanTextTurnParams = Omit<
  HumanTextTurn,
  "callSid" | "createdAt" | "id" | "order" | "role" | "type" | "version"
> & { id?: string };

// ========================================
// System Turns
// ========================================
export interface SystemTurn extends TurnRecordBase {
  content: string;
  role: "system";
}

export type SystemTurnParams = Omit<
  SystemTurn,
  "callSid" | "createdAt" | "id" | "order" | "role" | "version"
> & { id?: string };
