import twilio from "twilio";
import type { ConversationRelayAttributes } from "twilio/lib/twiml/VoiceResponse.js";
import {
  CALL_WRAPUP_WEBHOOK_ROUTE,
  CONVERSATION_RELAY_ROUTE,
} from "../../common/endpoints.js";
import { HOSTNAME } from "../../env.js";

if (!HOSTNAME) throw Error("Missing env variable HOSTNAME");

export interface MakeConversationRelayTwiML
  extends Omit<ConversationRelayAttributes, "url"> {
  callSid: string;
  context: {};
  parameters?: object; // values are stringified json objects
}

export function makeConversationRelayTwiML({
  callSid,
  context,
  parameters = {},
  ...params
}: MakeConversationRelayTwiML): string {
  const response = new twilio.twiml.VoiceResponse();

  const connect = response.connect({
    // action endpoint will be executed when an 'end' action is dispatched to the ConversationRelay websocket
    // https://www.twilio.com/docs/voice/twiml/connect/conversationrelay#end-session-message
    // In this implementation, we use the action for transfering conversations to a human agent
    action: `https://${HOSTNAME}${CALL_WRAPUP_WEBHOOK_ROUTE}`,
  });

  const conversationRelay = connect.conversationRelay({
    ...params,

    url: `wss://${HOSTNAME}${CONVERSATION_RELAY_ROUTE}`, // the websocket route defined below
    // @ts-ignore
    byottsConnector: "Default_Minimax",
  });

  conversationRelay.parameter({
    name: "context",
    value: JSON.stringify(context),
  });

  conversationRelay.language({
    ttsProvider: "elevenlabs",
    voice: "tOuLUAIdXShmWH7PEUrU",
    transcriptionProvider: "deepgram",
    code: "zh-CN",
  });

  // conversationRelay.language({
  //   ttsProvider: "minimax",
  //   voice: "Cantonese_ProfessionalHost（F)",
  //   transcriptionProvider: "deepgram",
  //   code: "zh-HK",
  // });

  Object.entries(parameters).forEach(([name, value]) =>
    conversationRelay.parameter({ name, value: JSON.stringify(value) })
  );

  return response.toString();
}
