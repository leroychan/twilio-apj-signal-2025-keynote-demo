import "dotenv-flow/config";

const warn: string[] = [];
const errs: string[] = [];

const env = (key: string, required = true): string => {
  const value = process.env[key];

  if (value === undefined)
    if (required) errs.push(key);
    else warn.push(key);

  delete process.env[key];

  return value as string;
};

// ========================================
// Server Config
// ========================================
export const PORT = process.env.PORT ?? "3333";
export const HOSTNAME = env("HOSTNAME", true);

// ========================================
// Foundry Model: Primary LLM
// ========================================
export const FOUNDRY_API_KEY = env("FOUNDRY_API_KEY");

export const AZURE_API_VERSION = env("AZURE_API_VERSION", false);
export const AZURE_LLM_DEPLOYMENT = env("AZURE_LLM_DEPLOYMENT");
export const AZURE_LLM_ENDPOINT = env("AZURE_LLM_ENDPOINT");

// ========================================
// Foundry Model: Embeddings, used by Recall
// ========================================
export const EMBED_ENDPOINT = env("EMBED_ENDPOINT");
export const EMBED_MODEL = env("EMBED_MODEL");
export const EMBED_API_VERSION = env("EMBED_API_VERSION", false);

// ========================================
// Azure AI Search, used by Recall
// ========================================
export const AZURE_SEARCH_ENDPOINT = env("AZURE_SEARCH_ENDPOINT");
export const AZURE_ADMIN_KEY = env("AZURE_ADMIN_KEY");
export const AZURE_SEARCH_INDEX = env("AZURE_SEARCH_INDEX");

// ========================================
// Azure Agents
// ========================================
export const AZURE_CONN_STRING = env("AZURE_CONN_STRING");
export const UNDERWRITER_AGENT_ID = env("UNDERWRITER_AGENT_ID");

// ========================================
// Twilio Credentials and Config
// ========================================
export const TWILIO_ACCOUNT_SID = env("TWILIO_ACCOUNT_SID");
export const TWILIO_API_KEY = env("TWILIO_API_KEY");
export const TWILIO_API_SECRET = env("TWILIO_API_SECRET");

export const TWILIO_SYNC_SVC_SID = env("TWILIO_SYNC_SVC_SID");
export const DEFAULT_TWILIO_NUMBER = env("DEFAULT_TWILIO_NUMBER");
export const TWILIO_FLEX_WORKFLOW_SID = env("TWILIO_FLEX_WORKFLOW_SID");

// ========================================
// Demo Configuration
// ========================================
export const USER_ID = env("USER_ID");
export const DEMO_USER_PHONE_NUMBER = env("DEMO_USER_PHONE_NUMBER");
export const DEMO_USER_PHONE_NUMBER_2 = env("DEMO_USER_PHONE_NUMBER_2");
export const DEMO_USER_FIRST_NAME = env("DEMO_USER_FIRST_NAME");
export const DEMO_USER_LAST_NAME = env("DEMO_USER_LAST_NAME");
export const DEMO_USER_EMAIL = env("DEMO_USER_EMAIL");

export const PRESENTATION_MODE = env("PRESENTATION_MODE");

export let ALLOWED_PHONE_NUMBERS = env("ALLOWED_PHONE_NUMBERS", false);
if (ALLOWED_PHONE_NUMBERS)
  ALLOWED_PHONE_NUMBERS = JSON.parse(ALLOWED_PHONE_NUMBERS);

// ========================================
// Audio
// ========================================
export const AUDIO_TYPING = env("AUDIO_TYPING", false);
export const AUDIO_PROCESSING = env("AUDIO_PROCESSING", false);

// ========================================
// Log and Throw
// ========================================
const C = { yellow: "\x1b[33m", red: "\x1b[31m", clear: "\x1b[0m" };

if (warn.length > 0) {
  const msg = "Missing optional environment variables: " + warn.join(", ");
  console.warn(C.yellow + msg + C.clear);
}

if (errs.length > 0) {
  const msg = "Missing required environment variables: " + errs.join(", ");
  console.error(C.red + msg + C.clear);
  throw new Error(msg);
}
