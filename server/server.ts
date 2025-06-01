import "./env.js"; // deletes sensitive secrets

import express from "express";
import expressWs from "express-ws";
import { checkSearchIndex } from "./agents/recall/vector-db.js";
import {
  CALL_STATUS_WEBHOOK_ROUTE,
  CALL_WRAPUP_WEBHOOK_ROUTE,
  CONVERSATION_RELAY_ROUTE,
  INCOMING_CALL_WEBHOOK_ROUTE,
  INCOMING_SMS_WEBHOOK_ROUTE,
  SYNC_WEBHOOK_ROUTE,
} from "./common/endpoints.js";
import { users } from "./common/mock-database/users.js";
import {
  DEFAULT_TWILIO_NUMBER,
  DEMO_USER_EMAIL,
  DEMO_USER_FIRST_NAME,
  DEMO_USER_LAST_NAME,
  DEMO_USER_PHONE_NUMBER,
  HOSTNAME,
  PORT,
  USER_ID,
  PRESENTATION_MODE,
} from "./env.js";
import * as underwriterEndpoints from "./tool-endpoints/underwriter-tools/index.js";
import { callStatusWebhookHandler } from "./webhook-endpoints/call-status/index.js";
import { callWrapupWebhookHandler } from "./webhook-endpoints/call-wrapup/index.js";
import { incomingCallWebhookHandler } from "./webhook-endpoints/incoming-call/index.js";
import { incomingSMSWebhookHandler } from "./webhook-endpoints/incoming-sms/index.js";
import { syncWebhookHandler } from "./webhook-endpoints/sync-webhook/index.js";
import { listenForIncomingCalls } from "./websocket-server/twilio/sync-client.js";
import { conversationRelayWebsocketHandler } from "./websocket-server/websocket-handler.js";
import { insertDummyRecallData } from "./agents/recall/data/examples.js";

const { app } = expressWs(express());
app.use(express.urlencoded({ extended: true })).use(express.json());

const restRoutes = [
  CALL_STATUS_WEBHOOK_ROUTE,
  CALL_WRAPUP_WEBHOOK_ROUTE,
  INCOMING_CALL_WEBHOOK_ROUTE,
  SYNC_WEBHOOK_ROUTE,
  INCOMING_SMS_WEBHOOK_ROUTE,
];

async function main() {
  console.log("");
  logTitle("Registering REST Routes:");
  console.log(restRoutes.join("\n"));
  app.post(CALL_STATUS_WEBHOOK_ROUTE, callStatusWebhookHandler);
  app.post(CALL_WRAPUP_WEBHOOK_ROUTE, callWrapupWebhookHandler);
  app.post(INCOMING_CALL_WEBHOOK_ROUTE, incomingCallWebhookHandler);
  app.post(SYNC_WEBHOOK_ROUTE, syncWebhookHandler);
  app.post(INCOMING_SMS_WEBHOOK_ROUTE, incomingSMSWebhookHandler);
  console.log("");

  logTitle("Registering Underwriter Agent Endpoints");
  for (const [route, handler] of Object.entries(underwriterEndpoints)) {
    app.post(`/agent/${route}`, handler);
  }

  logTitle("Registering Websocket:");
  console.log(CONVERSATION_RELAY_ROUTE);
  app.ws(CONVERSATION_RELAY_ROUTE, conversationRelayWebsocketHandler);
  console.log("");

  logTitle("Connecting Server-Side Sync Listener");
  await listenForIncomingCalls();
  console.log("");

  logTitle("Checking Azure Search Index");
  await checkSearchIndex();
  console.log("");

  app.listen(PORT, () => {
    logTitle("Server Started");
    const fullMsg = `\
Port                      ${PORT}
Local URL                 http://localhost:${PORT}

Hostname                  ${HOSTNAME}
Incoming Call Webhook     https://${HOSTNAME}${INCOMING_CALL_WEBHOOK_ROUTE}
Call Status Webhook       https://${HOSTNAME}${CALL_STATUS_WEBHOOK_ROUTE}

Twilio Phone Number       ${DEFAULT_TWILIO_NUMBER}
Allowed Callers           ${users.map(({ phone }) => phone).join(", ")}

Demo User Id              ${USER_ID}
Demo User Name            ${DEMO_USER_FIRST_NAME} ${DEMO_USER_LAST_NAME}
Demo User Phone           ${DEMO_USER_PHONE_NUMBER}
Demo User Email           ${DEMO_USER_EMAIL}

  `;

    if( PRESENTATION_MODE == "demo" ) {
      console.log(redactHostname(redactPhoneNumbers(fullMsg)));
    } else {
      console.log(fullMsg);
    }
  });
}

main();

// ========================================
// Misc
// ========================================
function logTitle(title: string) {
  console.log(`\x1b[32m${title}\x1b[0m`);
}

function redactHostname(input: string): string {
  const domainLikeRegex = /(?<![\w@])((https?:\/\/)?)([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(:\d+)?([\/\w?.=#-]*)?/g;

  return input.replace(domainLikeRegex, (match, _full, protocol = '', domain) => {
    const host = domain.split('.');
    if (host.length < 2) return match; // not a domain, skip

    host[0] = '••••••••••';
    const redacted = protocol + host.join('.');
    return match.replace(protocol + domain, redacted);
  });
}

function redactPhoneNumbers(input: string): string {
  const phoneRegex =
    /(\+?1[-\s.]?)?\(?(\d{3})\)?[-\s.]?(\d{3})[-\s.]?(\d{4,6})/g;

  return input.replace(
    phoneRegex,
    (match, countryCode, areaCode, prefix, lastFour) => {
      // Preserve the +1 country code if it exists
      const preservedCountryCode =
        countryCode && countryCode.includes("+") ? countryCode : "";

      // Count how many digits need to be redacted (excluding country code and last four)
      const digitsInAreaCodeAndPrefix = 7; // 3 for area code + 3 for prefix

      // Create bullet points for redacted digits
      const bullets = "•".repeat(digitsInAreaCodeAndPrefix);

      return `${preservedCountryCode}${areaCode}${bullets}`;
    }
  );
}
