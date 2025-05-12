import { RequestHandler } from "express";
import { setActiveCallSid } from "../../common/cache.js";
import { CALL_STATUS_WEBHOOK_ROUTE } from "../../common/endpoints.js";
import { updateCallStatus } from "../../common/sync-rest.js";
import { TwilioCallWebhookPayload } from "../../common/twilio-types.js";
import { ServerlessLogger } from "../logger.js";

export const callStatusWebhookHandler: RequestHandler = async (req, res) => {
  const payload = req.body as TwilioCallWebhookPayload;
  const callSid = payload.CallSid;
  const callStatus = payload.CallStatus;

  const log = new ServerlessLogger();

  try {
    log.info(CALL_STATUS_WEBHOOK_ROUTE, `${callSid}, status ${callStatus}`);

    await updateCallStatus(callSid, callStatus);

    if (callStatus === "completed") setActiveCallSid(undefined);
    if (callStatus === "failed") setActiveCallSid(undefined);
    if (callStatus === "busy") setActiveCallSid(undefined);

    res.status(200).send();
  } catch (error) {
    log.error(CALL_STATUS_WEBHOOK_ROUTE, `${callSid}, unknown error`, error);
    res.status(500).json({ status: "error", error });
  }
};
