import "dotenv-flow/config";
import PQueue from "p-queue";
import twilio from "twilio";
import { users } from "../../server/common/mock-database/users.js";
import { UserRecord } from "../../server/common/session-context.js";
import { isSyncNotFound } from "../../server/common/sync-errors.js";
import {
  makeFormItemName,
  makeUserDataMapName,
  makeUserRecordMapItemName,
} from "../../server/common/sync-ids.js";
import {
  FORM_NAME_1,
  FORM_NAME_2,
  makeForm1,
  makeForm2,
} from "../../server/common/forms.js";
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_SYNC_SVC_SID,
} from "../../server/env.js";

const TITLE_PAD = 30;

const twlo = twilio(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});
const sync = twlo.sync.v1.services(TWILIO_SYNC_SVC_SID);

// ========================================
// Command Line Args
// ========================================
const args = process.argv.slice(2);
const includeDefault = !args.length; // all true if no args
const include = {
  users: includeDefault,
};
type Key = keyof typeof include;

const valid = Object.keys(include) as Key[];

for (const arg of args)
  if (arg in include) include[arg as Key] = true;
  else throw Error(`Invalid arg ${arg}. Valid args: ${valid.join(", ")}`);

// ========================================
// Execute Main
// ========================================
async function main() {
  await printSummary();
  await sleep(1);
  if (include.users) await execute("Insert User Data", handleUserData);
}

async function execute(
  label: string,
  callback: (log: Logger) => Promise<void>,
) {
  printBreak(false);
  const title = `\x1b[7m${label.padEnd(TITLE_PAD, " ")}\x1b[0m`;
  const log = (...args: any[]) => console.log(title, ...args);
  log(`queued`);

  log(`starting`);
  await callback(log);
  log(`done`);
  printBreak(true);
}

type Logger = (...args: any) => void;

main();

const queue = new PQueue({ concurrency: 10 });

async function handleUserData(log: Logger) {
  const exec = async (user: UserRecord) => {
    log(`creating user: ${user.id}`);
    await checkMakeUserSyncObjects(user.id, log);
    log(`created user: ${user.id}`);
  };

  await Promise.all(
    users.map(async (user) => queue.add(async () => exec(user))),
  );

  console.log("");
}

export async function checkMakeUserSyncObjects(userId: string, log: Logger) {
  const uniqueName = makeUserDataMapName(userId);

  const title = `${userId}\t`;

  let isMapCreated = false;
  try {
    log(`${title} sync map check: starting`);
    if (!userId) throw Error(`userId is not defined`);
    await sync.syncMaps(uniqueName).fetch(); // throws 404 if not found
    isMapCreated = true;
    log(`${title} sync map check: found`);
  } catch (error) {
    if (isSyncNotFound(error)) {
      log(`${title} sync map check: not found`);

      isMapCreated = false;
    } else {
      log(`Error fetching sync user map`);
      throw error;
    }
  }

  if (!isMapCreated) {
    log(`${title} create sync map: starting`);
    await sync.syncMaps.create({ uniqueName });
    log(`${title} create sync map: success`);
  }

  let isForm1Created = false;
  try {
    log(`${title} form1 map item check: starting`);

    await sync
      .syncMaps(uniqueName)
      .syncMapItems(makeFormItemName(userId, FORM_NAME_1))
      .fetch(); // throws 404 if not found
    isForm1Created = true;
    log(`${title} form1 map item check: found`);
  } catch (error) {
    if (isSyncNotFound(error)) {
      log(`${title} form1 map item check: not found`);
      isForm1Created = false;
    } else {
      log(`Error fetching sync form`);
      throw error;
    }
  }

  const user = users.find((user) => user.id === userId);
  if (!user) throw Error(`User not found. Id: ${userId}`);

  if (!isForm1Created) {
    log(`${title} creating form1 map item: starting`);
    const form = makeForm1(user);
    await sync.syncMaps(uniqueName).syncMapItems.create({
      key: form.id,
      data: form,
    });
    log(`${title} creating form1 map item: success`);
  }

  let isForm2Created = false;
  try {
    log(`${title} form2 map item check: starting`);

    await sync
      .syncMaps(uniqueName)
      .syncMapItems(makeFormItemName(userId, FORM_NAME_2))
      .fetch(); // throws 404 if not found
    isForm2Created = true;
    log(`${title} form2 map item check: found`);
  } catch (error) {
    if (isSyncNotFound(error)) {
      log(`${title} form2 map item check: not found`);
      isForm2Created = false;
    } else {
      log(`Error fetching sync form`);
      throw error;
    }
  }

  if (!isForm2Created) {
    log(`${title} creating form2 map item: starting`);
    const form = makeForm2(user);
    await sync.syncMaps(uniqueName).syncMapItems.create({
      key: form.id,
      data: form,
    });
    log(`${title} creating form2 map item: success`);
  }

  let isRecordCreated = false;
  const userRecordItemName = makeUserRecordMapItemName(userId);
  try {
    log(`${title} user record map item check: starting`);

    await sync.syncMaps(uniqueName).syncMapItems(userRecordItemName).fetch(); // throws 404 if not found
    isRecordCreated = true;
    log(`${title} user record map item check: found`);
  } catch (error) {
    if (isSyncNotFound(error)) {
      log(`${title} user record map item check: not found`);
      isRecordCreated = false;
    } else {
      log(`Error fetching sync record`);
      throw error;
    }
  }

  if (!isRecordCreated) {
    log(`${title} created user record map item: starting`);
    const user = users.find((user) => user.id === userId);
    if (!user) throw Error("cannot find user");
    await sync.syncMaps(uniqueName).syncMapItems.create({
      key: userRecordItemName,
      data: user,
    });
    log(`${title} created user record map item: success`);
  }
}

// ========================================
// Summary
// ========================================
async function printSummary() {
  const title = `\x1b[7m${"Script Summary".padEnd(TITLE_PAD, " ")}\x1b[0m`;
  const log = (...args: any[]) => console.log(title, ...args);

  const included = valid.filter((key) => include[key]);
  const excluded = valid.filter((key) => !include[key]);
  printBreak();
  log(`Will be created: `, included.join(", "));
  log(`Will not created: `, excluded.join(", "));
  printBreak(false);
}

// ========================================
// Misc
// ========================================
function printBreak(newline = false) {
  console.log("=".padEnd(TITLE_PAD, "=") + (newline ? "\n" : ""));
}

async function sleep(sec: number) {
  console.log(`Sleeping ${sec}s`);
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(null);
    }, sec * 1000),
  );
}
