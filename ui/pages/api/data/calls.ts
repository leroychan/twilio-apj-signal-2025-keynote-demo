import {
  isContextMapName,
  isLogMapName,
  isTurnMapName,
  parseCallSid,
  SessionMetaData,
} from "@/shared";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_SYNC_SVC_SID,
} from "@/utils/env.server";
import type { NextApiHandler } from "next";
import twilio from "twilio";
import { SyncMapInstance } from "twilio/lib/rest/sync/v1/service/syncMap";

const client = twilio(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});
const sync = client.sync.v1.services(TWILIO_SYNC_SVC_SID);

const handler: NextApiHandler = async (req, res) => {
  let page = (req.query.page as string | undefined) ?? 1;
  if (typeof page === "string") page = parseInt(page);

  // first page returns top 20, all others return the rest
  const syncMaps =
    page === 0
      ? await sync.syncMaps
          .page({ pageSize: 20 })
          .then((data) => data.instances)
      : await sync.syncMaps.list();

  const recordMap = new Map<string, SessionMetaData>(); // for deduplication
  for (const map of syncMaps) {
    if (
      !isContextMapName(map.uniqueName) &&
      !isTurnMapName(map.uniqueName) &&
      !isLogMapName(map.uniqueName)
    )
      continue;

    const record = toSessionMetaData(map);
    recordMap.set(record.id, record);
  }

  res.json([...recordMap.values()]);
};

function toSessionMetaData(map: SyncMapInstance): SessionMetaData {
  const callSid = parseCallSid(map.uniqueName);
  return { id: callSid, callSid, dateCreated: map.dateCreated.toISOString() };
}

export default handler;
