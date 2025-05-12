import chunk from "lodash.chunk";
import set from "lodash.set";
import { z } from "zod";
import {
  FORM_NAME_1,
  FORM_NAME_2,
  FormNameType,
  FormRecord,
} from "../../common/forms.js";
import type { UnderwriterQuestion } from "../../common/session-context.js";
import type { StoreToolCall } from "../../common/session-turns.js";
import { sendPageChange, updateForm } from "../../common/sync-rest.js";
import type { WebsocketLogger } from "../../websocket-server/logger.js";
import type { SessionStore } from "../../websocket-server/session-store/index.js";
import type { ConversationRelayAdapter } from "../../websocket-server/twilio/conversation-relay-adapter.js";
import { AgentUnderwriter } from "../underwriter-agent/index.js";
import { AUDIO_PROCESSING, AUDIO_TYPING } from "../../env.js";

export interface ToolExecutionDependencies {
  log: WebsocketLogger;
  relay: ConversationRelayAdapter;
  store: SessionStore;
}

async function get_agent_wait_time(
  { department }: { department: string },
  deps: ToolExecutionDependencies,
) {
  await new Promise((resolve) =>
    setTimeout(() => {
      resolve(null);
    }, 2000),
  );

  return { department, wait_time: "35 minutes" };
}

async function ask_virtual_underwriter(
  args: Omit<UnderwriterQuestion, "userId">,
  deps: ToolExecutionDependencies,
) {
  const agent = new AgentUnderwriter(deps.store);

  const userId = deps.store.context.user.id;

  const interval = setInterval(() => {
    if (!AUDIO_PROCESSING) return;

    deps.relay.playMedia(AUDIO_PROCESSING, { loop: 1, preemptible: true });
  }, 1000);

  const result = await agent.reviewApplication({ ...args, userId });

  clearInterval(interval);

  return result;
}

interface RequestScreenControlPermission {
  reason: string;
  scope: "view_only" | "view_and_control";
}

async function request_screen_control_permission(
  args: RequestScreenControlPermission,
  deps: ToolExecutionDependencies,
) {
  deps.store.context.update((ctx) => ({
    screenControl: {
      ...ctx.screenControl,
      permission: "requested",
      scope: args.scope ?? "view_and_control",
      reason: args.reason ?? "",
    },
  }));

  return { ...deps.store.context.screenControl };
}

interface NavigateToFormPageArgs {
  formName: FormNameType;
  userId: string;
}

async function navigate_to_form_page(
  args: NavigateToFormPageArgs,
  deps: ToolExecutionDependencies,
) {
  const permission = deps.store.context.screenControl.permission;

  if (permission !== "approved")
    return {
      status: "unauthorized",
      message: `\
      The user must approve the request for screen control. The current status \
      is ${permission}. Execute request_screen_control_permission to request permission \
      from the user.`,
    };

  await sendPageChange({
    userId: args.userId ?? deps.store.context.user.id,
    formName: args.formName,
  });

  deps.store.context.update((ctx) => ({
    screenControl: {
      ...(ctx.screenControl ?? {}),
      formPage: args.formName,
    },
  }));

  setTimeout(() => {
    if (args.formName === "19B-8671-D")
      deps.store.context.update((ctx) => ({
        form_1: { ...ctx.form_1, status: "started" },
      }));

    if (args.formName === "19B-8671-TPS")
      deps.store.context.update((ctx) => ({
        form_2: { ...ctx.form_2, status: "started" },
      }));
  }, 1000);

  return { formPage: args.formName, status: "success" };
}

// ========================================
// Update Form Tools
// ========================================

export const UpdateFormFieldsArgsSchema = z.object({
  formName: z.enum([FORM_NAME_1, FORM_NAME_2]),
  updates: z.array(
    z.object({
      path: z.string().min(1),
      value: z.union([z.string(), z.number(), z.boolean(), z.any()]),
    }),
  ),
});
export type UpdateFormFieldsArgs = z.infer<typeof UpdateFormFieldsArgsSchema>;

function maybeParseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Ignore parse errors – treat as plain string
    }
  }
  return value;
}

/**
 * - Deep‑clones the form to avoid mutating shared state.
 * - Validates arguments with Zod and returns actionable error details.
 * - Parses JSON strings automatically so callers can pass objects/arrays inline.
 * - Uses lodash `set` to support bracket‑notation in paths (arrays).
 * - Logs errors but never crashes the client; instead returns a failed status.
 */
export async function update_form_fields(
  rawArgs: unknown,
  deps: ToolExecutionDependencies,
) {
  // 1. Permissions
  const { permission } = deps.store.context.screenControl;
  if (permission !== "approved") {
    return {
      status: "unauthorized",
      message:
        `Screen‑control permission is ${permission}. ` +
        `Call request_screen_control_permission first.`,
    } as const;
  }

  // 2. Schema validation
  const parsed = UpdateFormFieldsArgsSchema.safeParse(rawArgs);
  if (!parsed.success) {
    return {
      status: "invalid_arguments",
      message: parsed.error.flatten().formErrors.join("; "),
    } as const;
  }
  const args = parsed.data;

  // 3. Clone the form (structuredClone keeps nested references intact)
  const form = structuredClone(deps.store.context.form_2) as FormRecord;

  // 4. Apply updates
  const updateChunks = chunk(args.updates, 2);

  // // play typing if the function takes to long
  // deps.relay.playMedia(AUDIO_TYPING, { loop: 15, preemptible: true });
  // const interval = setInterval(() => {
  //   if (!AUDIO_TYPING) return;
  //   deps.relay.playMedia(AUDIO_TYPING, { loop: 15, preemptible: true });
  // }, 15 * 1000);

  for (const updates of updateChunks) {
    for (const { path, value } of updates) {
      try {
        const json = maybeParseJson(value);
        set(form, path, json);
      } catch (err) {
        deps.log.error("tools", "update_form_fields failed", {
          path,
          value,
          err,
        });
        return {
          status: "failed",
          message: `Could not apply value at path \"${path}\": ${
            (err as Error).message
          }`,
        } as const;
      }
    }
    // send to sync
    await updateForm(
      deps.store.context.user.id,
      form.formName,
      form as FormRecord,
    );
  }

  // clearInterval(interval);

  return { status: "success", applied: args.updates.length };
}

export const executeTool = async (
  fn: StoreToolCall["function"],
  deps: ToolExecutionDependencies,
) => {
  let args = fn.arguments;
  try {
    args = JSON.parse(fn.arguments);
  } catch (error) {
    deps.log.warn(`tools`, `unable to parse arguments for ${fn.name}`);
  }

  let result: any | undefined = undefined;

  switch (fn.name) {
    case "get_agent_wait_time":
      result = await get_agent_wait_time(args, deps);
      break;

    case "ask_virtual_underwriter":
      result = ask_virtual_underwriter(args, deps);
      break;

    case "request_screen_control_permission":
      result = request_screen_control_permission(args, deps);
      break;

    case "navigate_to_form_page":
      result = navigate_to_form_page(args, deps);
      break;

    case "update_form_fields":
      result = update_form_fields(args, deps);
      break;

    default:
      throw Error("Tool not found");
  }

  return result;
};
