import { makeLogMapName, SegmentInteractionLog } from "@/shared";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_SYNC_SVC_SID,
} from "@/utils/env.server";
import type { NextApiHandler } from "next";
import twilio from "twilio";

const client = twilio(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});
const sync = client.sync.v1.services(TWILIO_SYNC_SVC_SID);

const postHandler: NextApiHandler = async (req, res) => {
  let data: SegmentInteractionLog;
  try {
    data = JSON.parse(req.body);
  } catch (error) {
    data = req.body;
    console.log("Error in postHandler", error);
  }

  try {
    const logsMapName = makeLogMapName(data.callSid);
    const result = await sync
      .syncMaps(logsMapName)
      .syncMapItems.create({ key: data.id, data });

    res.status(200).send({ result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error, status: "error" });
  }
};

const handler: NextApiHandler = async (req, res) => {
  switch (req.method?.toLowerCase()) {
    case "post":
      return postHandler(req, res);

    default:
      res.status(404).end();
  }
};

export default handler;
