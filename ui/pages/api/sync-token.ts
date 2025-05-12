import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
} from "@/utils/env.server";
import type { NextApiHandler, NextApiRequest } from "next";
import twilio from "twilio";

const handler: NextApiHandler = (req: NextApiRequest, res) => {
  const identity =
    (req.query.identity as string) || (req.body.identity as string);

  const AccessToken = twilio.jwt.AccessToken;
  const SyncGrant = AccessToken.SyncGrant;

  const token = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY,
    TWILIO_API_SECRET,
    { identity },
  );

  token.addGrant(
    new SyncGrant({ serviceSid: process.env.TWILIO_SYNC_SVC_SID }),
  );

  res.json({ identity, token: token.toJwt() });
};

export default handler;
