import { RequestHandler } from "express";
import { INCOMING_SMS_WEBHOOK_ROUTE } from "../../common/endpoints.js";
import { sendIncomingSMSStreamMsg } from "../../common/sync-rest.js";
import { ServerlessLogger } from "../logger.js";

export const incomingSMSWebhookHandler: RequestHandler = async (req, res) => {
  const payload = req.body as { From: string; To: string; Body: string };

  const log = new ServerlessLogger();

  try {
    log.info(INCOMING_SMS_WEBHOOK_ROUTE, `sms received: "${payload.Body}"`);

    await sendIncomingSMSStreamMsg({
      body: payload.Body,
      from: payload.From,
      to: payload.To,
    });

    res.status(200).send();
  } catch (error) {
    log.error(INCOMING_SMS_WEBHOOK_ROUTE, `unknown error`, error);
    res.status(500).json({ status: "error", error });
  }
};
