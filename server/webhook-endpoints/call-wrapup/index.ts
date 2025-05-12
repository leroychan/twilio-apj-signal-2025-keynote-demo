import { RequestHandler } from "express";
import { CALL_WRAPUP_WEBHOOK_ROUTE } from "../../common/endpoints.js";
import { ServerlessLogger } from "../logger.js";

export const callWrapupWebhookHandler: RequestHandler = async (req, res) => {
  const payload = req.body;
  const callSid = payload.CallSid;

  const log = new ServerlessLogger();

  try {
    res.status(200).send();
  } catch (error) {
    log.error(CALL_WRAPUP_WEBHOOK_ROUTE, `${callSid}, unknown error`, error);
    res.status(500).json({ status: "error", error });
  }
};
