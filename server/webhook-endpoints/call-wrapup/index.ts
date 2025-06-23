import { RequestHandler } from "express";
import { CALL_WRAPUP_WEBHOOK_ROUTE } from "../../common/endpoints.js";
import { ServerlessLogger } from "../logger.js";

import { TWILIO_FLEX_WORKFLOW_SID } from "../../env.js";

export const callWrapupWebhookHandler: RequestHandler = async (req, res) => {
  const payload = req.body;
  const callSid = payload.CallSid;
  const handoffData = JSON.parse(payload.HandoffData);
  const destination = handoffData?.data?.destination || "unknown";

  const log = new ServerlessLogger();

  try {

    
    log.info(CALL_WRAPUP_WEBHOOK_ROUTE, `call wrapup webhook received. transferring to ${destination}. ${JSON.stringify(payload)}`);    
    
    let twiml = "";
    switch (destination) {
      case "agent":
        twiml = `<Response>
            <Enqueue workflowSid="${TWILIO_FLEX_WORKFLOW_SID}">
                <Task>${payload.HandoffData}</Task>
            </Enqueue>
        </Response>`;
        break;

      case "end":
        twiml = `<Response> \ 
                  <Say language='en-GB'>Thank you for calling. Goodbye!</Say> \
                  </Response>`;
        break;
      default:
        twiml = `<Response> \
                  <Say language='en-GB'>Well that's unexpected! \
                  You'll need to tell me what you want me to do. Otherwise, I'm hanging up</Say> \
                  </Response>`;
        break;
    }
    log.info(CALL_WRAPUP_WEBHOOK_ROUTE, `twiml response: ${twiml}`);    

    res.status(200).type("text/xml").send(twiml);
  } catch (error) {
    log.error(CALL_WRAPUP_WEBHOOK_ROUTE, `${callSid}, unknown error`, error);
    res.status(500).json({ status: "error", error });
  }
};
