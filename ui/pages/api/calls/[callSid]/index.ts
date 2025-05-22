import {
  makeContextMapName,
  makeLogMapName,
  makeTurnMapName,
  TurnRecord,
} from "@/shared";
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

const deleteHandler: NextApiHandler = async (req, res) => {
  const callSid = req.query.callSid as string;

  const ctxMapName = makeContextMapName(callSid);
  const turnsMapName = makeTurnMapName(callSid);
  const logsMapName = makeLogMapName(callSid);

  try {
    await Promise.all([
      sync.syncMaps(ctxMapName).remove(),
      sync.syncMaps(turnsMapName).remove(),
      sync.syncMaps(logsMapName).remove(),
    ]);

    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error, status: "error" });
  }
};

const getHandler: NextApiHandler = async (req, res) => {
  const callSid = req.query.callSid as string;

  const ctxMapName = makeContextMapName(callSid);
  const turnsMapName = makeTurnMapName(callSid);
  const logsMapName = makeLogMapName(callSid);

  try {
    const [ctx, turns, logs] = await Promise.all([
      sync.syncMaps(ctxMapName).syncMapItems.list(),
      sync.syncMaps(turnsMapName).syncMapItems.list(),
      sync.syncMaps(logsMapName).syncMapItems.list(),
    ]);

    res.status(200).json({
      context: ctx
        .map((item) => ({ [item.key]: item.data }))
        .reduce((acc, obj) => Object.assign(acc, obj), {}),

      turns: turns
        .map((item) => item.data as unknown as TurnRecord)
        .sort((a, b) => a.order - b.order),

      logs: logs.map((item) => item.data),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error, status: "error" });
  }
};

const handler: NextApiHandler = async (req, res) => {
  switch (req.method?.toLowerCase()) {
    case "delete":
      return deleteHandler(req, res);

    case "get":
      return getHandler(req, res);

    default:
      res.status(404).end();
  }
};

export default handler;
