import type { ConversationRelayAttributes } from "twilio/lib/twiml/VoiceResponse.js";

export const relayConfig: Omit<ConversationRelayAttributes, "url"> = {
  ttsProvider: "ElevenLabs",
  // voice: "g6xIsTj2HwM6VR4iXFCw", // jessica anne, friendly and conversational female voice, motherly
  // voice: "rCmVtv8cYU60uhlsOo1M", // ana, soft, british
  voice: "UgBBYS2sOqTuMpoF3BR0", // mark, conversational, natural

  transcriptionProvider: "Deepgram",
  speechModel: "nova-3-general",
};
