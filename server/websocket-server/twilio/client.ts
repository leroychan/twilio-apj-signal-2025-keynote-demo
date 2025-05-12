import twilio from "twilio";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
} from "../../env.js";
if (!TWILIO_ACCOUNT_SID) throw Error("Missing env TWILIO_ACCOUNT_SID");
if (!TWILIO_API_KEY) throw Error("Missing env TWILIO_API_KEY");
if (!TWILIO_API_SECRET) throw Error("Missing env TWILIO_API_SECRET");

export const twilioClient = twilio(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});
