import "dotenv-flow/config";
import twilio from "twilio";
import {
  isContextMapName,
  isLogMapName,
  isTurnMapName,
  isUserDataMapName,
  parseCallSid,
} from "../../server/common/sync-ids.js";
import PQueue from "p-queue";

const TITLE_PAD = 30;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID as string;
const TWILIO_API_KEY = process.env.TWILIO_API_KEY as string;
const TWILIO_API_SECRET = process.env.TWILIO_API_SECRET as string;
const TWILIO_SYNC_SVC_SID = process.env.TWILIO_SYNC_SVC_SID as string;

if (!TWILIO_ACCOUNT_SID) throw Error("Missing TWILIO_ACCOUNT_SID");
if (!TWILIO_API_KEY) throw Error("Missing TWILIO_API_KEY");
if (!TWILIO_API_SECRET) throw Error("Missing TWILIO_API_SECRET");
if (!TWILIO_SYNC_SVC_SID) throw Error("Missing TWILIO_SYNC_SVC_SID");

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
  calls: includeDefault,
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
  await sleep(3);
  if (include.calls) await execute("Delete Sync Calls", removeSyncCallRecords);
  if (include.users) await execute("Delete Sync Users", removeSyncUserRecords);
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

// ========================================
// Summary
// ========================================
async function printSummary() {
  const title = `\x1b[7m${"Script Summary".padEnd(TITLE_PAD, " ")}\x1b[0m`;
  const log = (...args: any[]) => console.log(title, ...args);

  const included = valid.filter((key) => include[key]);
  const excluded = valid.filter((key) => !include[key]);
  printBreak();
  log(`Will be deleted: `, included.join(", "));
  log(`Will not delete: `, excluded.join(", "));
  printBreak(false);
}

// ========================================
// Call Cleanup
// ========================================
async function removeSyncCallRecords(log: Logger) {
  const maps = await sync.syncMaps.list();
  const ctxMaps = maps.filter((map) => isContextMapName(map.uniqueName));
  const turnMaps = maps.filter((map) => isTurnMapName(map.uniqueName));
  const logMaps = maps.filter((map) => isLogMapName(map.uniqueName));

  let callSet = new Set<string>();
  for (const map of ctxMaps) callSet.add(parseCallSid(map.uniqueName));
  for (const map of turnMaps) callSet.add(parseCallSid(map.uniqueName));

  const callSids = [...callSet];
  log(
    `found ${callSids.length} calls. context maps: ${ctxMaps.length}; turn maps: ${turnMaps.length}; log maps: ${logMaps.length}`,
  );
  if (!ctxMaps.length && !turnMaps.length) return;

  log("starting");

  const queue = new PQueue({ concurrency: 5 });

  const tasks = [
    ...ctxMaps.map((map) => () => sync.syncMaps(map.sid).remove()),
    ...turnMaps.map((map) => () => sync.syncMaps(map.sid).remove()),
    ...logMaps.map((map) => () => sync.syncMaps(map.sid).remove()),
  ];

  const results = await Promise.allSettled(
    tasks.map((task) => queue.add(task)),
  );

  const success = results.filter((res) => res.status === "fulfilled");
  const failed = results.filter((res) => res.status === "rejected");
  log(`deleted: ${success.length}, failed: ${failed.length}`);
}

// ========================================
// User Records
// ========================================
async function removeSyncUserRecords(log: Logger) {
  const maps = await sync.syncMaps.list();
  const userMaps = maps.filter((map) => isUserDataMapName(map.uniqueName));

  log(`found ${userMaps.length} user sync maps`);
  if (!userMaps.length) return;
  log("starting");
  const results = await Promise.allSettled([
    ...userMaps.map((map) => sync.syncMaps(map.sid).remove()),
  ]);

  const success = results.filter((res) => res.status === "fulfilled");
  const failed = results.filter((res) => res.status === "rejected");
  log(`deleted: ${success.length}, failed: ${failed.length}`);
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
