import { RequestHandler } from "express";
import { CALL_WRAPUP_WEBHOOK_ROUTE } from "../../common/endpoints.js";
import { ServerlessLogger } from "../logger.js";

export const callWrapupWebhookHandler: RequestHandler = async (req, res) => {
  const payload = req.body;
  const callSid = payload.CallSid;

  const log = new ServerlessLogger();

  try {
  
    log.info(CALL_WRAPUP_WEBHOOK_ROUTE, `call wrapup webhook received`, {
      payload
    });    
    
    const twiml = `\
<Response>
  <Say language='en-GB'>Well that's a wrap! you'll need to tell me what you want me to do. Otherwise, I'm hanging up</Say>
</Response>
    `;

    res.status(200).type("text/xml").send(twiml);
  } catch (error) {
    log.error(CALL_WRAPUP_WEBHOOK_ROUTE, `${callSid}, unknown error`, error);
    res.status(500).json({ status: "error", error });
  }
};
