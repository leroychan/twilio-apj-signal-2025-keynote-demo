import type { RequestHandler } from "express";
import { SYNC_WEBHOOK_ROUTE } from "../../common/endpoints.js";
import { ServerlessLogger } from "../logger.js";

export const syncWebhookHandler: RequestHandler = async (req, res) => {
  const payload = req.body;

  const log = new ServerlessLogger();

  try {
    log.info(SYNC_WEBHOOK_ROUTE, "payload\n", JSON.stringify(payload, null, 2));

    res.status(200).send();
  } catch (error) {
    log.error(SYNC_WEBHOOK_ROUTE, `unknown error`, error);
    res.status(500).json({ status: "error", error });
  }
};
