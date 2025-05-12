import {
  HOSTNAME,
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY,
  TWILIO_API_SECRET,
  TWILIO_SYNC_SVC_SID,
  USER_ID,
} from "../../env.js";

// todo: add Azure to this validation

const errors: string[] = [];

const addError = (env: string) => {
  const msg = `Missing environment variable ${env}`;
  console.error(`\x1b[31m${msg}\x1b[0m`);
  errors.push(msg);
};

const warn = (env: string) => {
  const msg = `(warning) Missing environment variable ${env}`;
  console.warn(`\x1b[33m${msg}\x1b[0m`);
};

if (!TWILIO_ACCOUNT_SID) addError("TWILIO_ACCOUNT_SID");
if (!TWILIO_API_KEY) addError("TWILIO_API_KEY");
if (!TWILIO_API_SECRET) addError("TWILIO_API_SECRET");
if (!TWILIO_SYNC_SVC_SID) addError("TWILIO_SYNC_SVC_SID");

const hostnameRegex =
  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

if (!HOSTNAME) addError("HOSTNAME");
else if (!hostnameRegex.test(HOSTNAME)) {
  warn(
    "Invalid HOSTNAME. Only include the hostname, e.g. domain.com or sub.domain.com, not the other URL elements, e.g. http://",
  );
}

if (!USER_ID) addError("USER_ID");
