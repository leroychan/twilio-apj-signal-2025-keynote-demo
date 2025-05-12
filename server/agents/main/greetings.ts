/**
 * @fileoverview
 *
 * @customize
 */

import type { SessionContextParams } from "../../common/session-context.js";
import { interpolateString } from "../../common/utils/interpolate-string.js";
import { createRoundRobinPicker } from "../../common/utils/round-robin-picker.js";

const picker = createRoundRobinPicker();

const inboundGreetings = [
  "Hello, you've reached {{company.name}}. Am I speaking with {{user.first_name}}?",

  //   `\
  // Hello you've reached {{company.name}}. It will be approximately, 43 minutes, to speak to a human agent.\
  // However, I'm an intelligent voice assistant and may be able to help you, {{user.first_name}}. \
  // Are you calling about your mortgage application?`,
];

export async function getInboundGreeting(context: SessionContextParams) {
  const template = picker(inboundGreetings);

  return interpolateString(template, context);
}
