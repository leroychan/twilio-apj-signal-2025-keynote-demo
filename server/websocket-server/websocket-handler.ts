import "./utils/validate-env.js";

import type { WebSocket } from "ws";
import { RecallAgent } from "../agents/recall/index.js";
import { SummaryAgent } from "../agents/summary/index.js";
import { getActiveCallSid, setActiveCallSid } from "../common/cache.js";
import {
  FORM_NAME_1,
  FORM_NAME_2,
  type FormRecord,
  type FormRecord_1,
  type FormRecord_2,
} from "../common/forms.js";
import type { BotTextTurn } from "../common/session-turns.js";
import {
  INCOMING_SMS_STREAM,
  makeContextMapName,
  makeUserDataMapName,
} from "../common/sync-ids.js";
import type { LLMInterface } from "./llm/interface.js";
import { OpenAIResponseService } from "./llm/openai-response.js";
import { getMakeWebsocketLogger, WebsocketLogger } from "./logger.js";
import { SessionStore } from "./session-store/index.js";
import { ConversationRelayAdapter } from "./twilio/conversation-relay-adapter.js";
import { startRecording } from "./twilio/recording.js";
import { getSyncClientPromise } from "./twilio/sync-client.js";
import { SyncQueueService } from "./twilio/sync-queue.js";
import {
  IncomingSMSStreamMsg,
  ScreenControlState,
} from "../common/session-context.js";

export const conversationRelayWebsocketHandler = async (ws: WebSocket) => {
  const relay = new ConversationRelayAdapter(ws); // wrapper around the ConversationRelay websocket

  let store: SessionStore; // stores turn history and session context
  let llm: LLMInterface; // handles the primary LLM loop
  let log: WebsocketLogger;

  // ensures classes are not referenced until initialized by blocking the event loop until onSetup is received
  let resolveSetup: () => void;
  const setupPromise = new Promise<void>((resolve) => (resolveSetup = resolve));

  relay.onSetup((ev) => {
    setActiveCallSid(ev.callSid);
    log = getMakeWebsocketLogger(ev.callSid);
    log.info(
      "relay.onSetup",
      `sessionId ${ev.sessionId}, callSid ${ev.callSid}`,
    );

    const params = ev.customParameters ?? {};
    const paramsContext = "context" in params ? JSON.parse(params.context) : {};

    store = new SessionStore(ev, paramsContext);
    llm = new OpenAIResponseService(relay, store);

    const greeting =
      params.welcomeGreeting && JSON.parse(params.welcomeGreeting);
    if (greeting) {
      store.turns.addBotText({
        content: greeting,
        responseId: "greeting",
        status: "complete",
      });
      log.info("llm.transcript", greeting);
    }

    resolveSetup(); // unblock event loop

    startRecording(ev.callSid).then(
      (recordingUrl) =>
        recordingUrl &&
        store.context.update(({ call }) => ({
          call: { ...call, recordingUrl },
        })),
    );

    store!.context.update(({ call }) => ({
      call: { ...call, status: "in-progress" },
    }));
  });

  // ========================================
  // Handle Incoming Messages from Conversation Relay
  // ========================================

  // human speech received
  relay.onPrompt((ev) => {
    log.info("relay.onPrompt", ev.voicePrompt);

    if (!ev.last) return; // do nothing for partial speech

    // force all bot turns to stop their streaming status
    const turns = store.turns.list();
    for (const turn of turns) {
      if (turn.role !== "bot") continue;
      if (turn.status === "streaming") turn.status = "complete";
    }

    store.turns.addHumanText({ content: ev.voicePrompt });
    llm.run();
    // setTimeout(() => {
    //   llm.run();
    // }, 200);
  });

  // human interrupts bot
  relay.onInterrupt((ev) => {
    log.info(
      `relay.onInterrupt`,
      `human interrupted bot`,
      ev.utteranceUntilInterrupt,
    );
    llm.abort(); // cancel any completions currently underway
    store.turns.redactInterruption(ev.utteranceUntilInterrupt); // update conversation history to reflect any words that the were not spoken and remove any tool requests that were not resolved
  });

  // set spoken text
  relay.onTokensPlayed((ev) => {
    let turns = [...store.turns.list()].reverse();
    const turn = turns.find(
      (turn): turn is BotTextTurn =>
        turn.role === "bot" &&
        turn.type === "text" &&
        turn.content.includes(ev.value.trim()),
    );

    if (!turn) return log.warn("onTokensPlayed", `turn not found: ${ev.value}`);

    const index = turn.content.lastIndexOf(ev.value);
    turn.spoken = turn.content.slice(0, index + ev.value.length);
  });

  // human sent dtmf
  relay.onDTMF((ev) => {
    log.info(`relay.onDTMF`, `dtmf (human): ${ev.digit}`);

    store.turns.addHumanDTMF({ content: ev.digit });
    // the user must enter # to trigger the run.
    // todo: test dtmf to determine if/how the digits should be accumulated
    if (ev.digit.includes("#")) llm.run();
  });

  // relay.onError only emits errors received from the ConversationRelay websocket, not local errors.
  relay.onError((ev) => {
    log.error(`relay.onError`, `ConversationRelay error: ${ev.description}`);
    throw Error(
      `Relay Websocket Error: type: ${ev.type}, description: ${ev.description}`,
    );
  });

  await setupPromise; // blocks event loop until onSetup finishes

  // ========================================
  // Handle LLM Responses
  // ========================================
  // llm has produced DTMF digits
  llm!.on("dtmf", (digits) => relay.sendDTMF(digits));

  // llm has produced a text token
  llm!.on("text", (text, last, fullText) => {
    relay.sendTextToken(text, last);

    if (last && fullText) log.info("llm.text", fullText);
  });

  // ========================================
  // Synchronize State w/Database
  // ========================================
  const sync = await getSyncClientPromise(store!.callSid);
  const syncQueue = new SyncQueueService(
    sync,
    store!.callSid,
    () => store.context,
    (turnId: string) => store.turns.get(turnId),
  );

  // ========================================
  // Context Subscribers
  // ========================================
  const addSystemMessageOnScreenControl = (
    key: string,
    data: ScreenControlState,
  ) => {
    if (key !== "screenControl") return;

    const prevPermission = store!.context?.screenControl?.permission;
    const nextPermission = data?.permission;

    if (!prevPermission) return;
    if (!nextPermission) return;

    if (prevPermission === nextPermission) return;

    if (prevPermission !== "requested") return;

    if (nextPermission === "approved" || nextPermission === "rejected") {
      store.turns.addSystemTurn({
        content: `The user has ${nextPermission} the screen control request`,
        metadata: { display: true },
      });

      if (!llm.isStreaming) llm.run();
    }
  };

  sync.map(makeContextMapName(store!.callSid)).then((map) => {
    map.on("itemAdded", ({ item }) => {
      store.context.update({ [item.key]: item.data }, false);
    });
    map.on("itemRemoved", ({ key }) => {
      store.context.update({ [key]: undefined }, false);
    });
    map.on("itemUpdated", ({ item }) => {
      addSystemMessageOnScreenControl(
        item.key,
        item.data as ScreenControlState,
      );
      store.context.update({ [item.key]: item.data }, false);
    });
  });

  store!.context.on("contextUpdated", ({ keys }) =>
    keys.forEach((key) => syncQueue.updateContext(key)),
  );

  // send the initial context to sync
  for (const key of store!.context.keys()) {
    if (!(typeof store!.context[key] === "object")) continue; // sync only supports objects
    syncQueue.updateContext(key);
  }

  // ========================================
  // Turn Subscribers
  // ========================================
  // send new turns to external database
  store!.turns.on("turnAdded", (turn) => {
    log.info("turnAdded", turn.id, turn.role);
    syncQueue.addTurn(turn);
  });

  // delete turn from external database
  store!.turns.on("turnDeleted", (turnId, turn) => {
    log.info("turnDeleted", turnId);
    syncQueue.deleteTurn(turnId);
  });

  // update turn in database
  store!.turns.on("turnUpdated", (turnId) => {
    syncQueue.updateTurn(turnId); // sync-queue grabs the turn just before the request
  });
  for (const turn of store!.turns.list()) syncQueue.addTurn(turn);

  // ========================================
  // Sync Subscribers
  // ========================================
  // the session context's form is controlled by to the user's sync record
  sync.map(makeUserDataMapName(store!.context.user.id)).then((map) => {
    map.on("itemUpdated", ({ item }) => {
      const data = item.data as FormRecord;
      if (data.formName === FORM_NAME_1) {
        store.context.update({ form_1: data as FormRecord_1 });
      }

      if (data.formName === FORM_NAME_2) {
        store.context.update({ form_2: data as FormRecord_2 });
      }
    });
  });

  // incoming sms
  // note: in a real implementation, 2way SMS should be done Twilio Conversation w/Conversation-Scoped Webhook
  sync.stream(INCOMING_SMS_STREAM).then((stream) => {
    stream.on("messagePublished", ({ message }) => {
      const data = message.data as IncomingSMSStreamMsg;

      store.turns.addSystemTurn({
        content: `sms message received. body: "${data.body}"`,
        metadata: { origin: "sms" },
      });

      if (!llm.isStreaming) llm.run();
    });
  });

  // ========================================
  // Start Subconscious Processes
  // ========================================
  const recall = new RecallAgent(store!);
  recall.start();

  const summary = new SummaryAgent(store!);
  summary.start();

  // ========================================
  // Finally
  // ========================================

  ws.on("close", () => {
    const activeCallSid = getActiveCallSid();
    if (activeCallSid !== store.callSid)
      log.warn(
        "close",
        "activeCallSid does not match store.callSid",
        activeCallSid,
        store.callSid,
      );

    setActiveCallSid(undefined);

    recall.stop();
    summary.stop();

    log.info(
      "websocket",
      "conversation relay ws closed.",
      "\n/** session turns **/\n",
      JSON.stringify(store?.turns.list(), null, 2),
      "\n/** session context **/\n",
      JSON.stringify(store?.context, null, 2),
    );
  });
};
