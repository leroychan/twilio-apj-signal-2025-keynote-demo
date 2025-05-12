import {
  isUserDataMapName,
  makeUserDataMapName,
  makeUserRecordMapItemName,
  parseUserId,
} from "@/shared";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_SYNC_SVC_SID,
  USER_ID,
} from "@/utils/env.server";
import type { NextApiHandler } from "next";
import twilio from "twilio";

const client = twilio(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});
const sync = client.sync.v1.services(TWILIO_SYNC_SVC_SID);

const handler: NextApiHandler = async (req, res) => {
  let page = (req.query.page as string | undefined) ?? 1;
  if (typeof page === "string") page = parseInt(page);

  // fetch the default user first
  if (page === 0) {
    const userItem = await sync
      .syncMaps(makeUserDataMapName(USER_ID))
      .syncMapItems(makeUserRecordMapItemName(USER_ID))
      .fetch();

    res.json([userItem.data]);
    return;
  }

  // fetch the rest of the users
  const syncMaps = await sync.syncMaps.list();

  const userIds: string[] = [];
  for (const map of syncMaps) {
    if (!isUserDataMapName(map.uniqueName)) continue;
    userIds.push(parseUserId(map.uniqueName));
  }

  const allUserMapItems = await Promise.all(
    userIds.map((userId) =>
      sync
        .syncMaps(makeUserDataMapName(userId))
        .syncMapItems(makeUserRecordMapItemName(userId))
        .fetch(),
    ),
  );

  res.json(allUserMapItems.map((item) => item.data));
};

export default handler;
