import { getMakeWebsocketLogger } from "../logger.js";
import { twilioClient } from "./client.js";

export const startRecording = async (
  callSid: string,
): Promise<void | string> => {
  const log = getMakeWebsocketLogger(callSid);

  return twilioClient
    .calls(callSid)
    .recordings.create({ recordingChannels: "dual" })
    .then(({ errorCode, uri }) => {
      if (!errorCode)
        return `https://api.twilio.com${uri.replace(".json", "")}`;

      log.warn("llm", `unable to record call`);
    })
    .catch((error) => {
      log.warn("llm", `unable to record call`, error);
    });
};
