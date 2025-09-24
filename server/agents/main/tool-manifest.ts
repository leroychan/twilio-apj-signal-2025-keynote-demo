import type { Tool } from "openai/resources/responses/responses.mjs";
import type { SessionContextStore } from "../../websocket-server/session-store/context-store.js";
import { FORM_NAME_1, FORM_NAME_2 } from "../../common/forms.js";

const tools: Tool[] = [
  {
    type: "function",
    name: "get_agent_wait_time",
    strict: true,
    description:
      "Get the current wait time for agents in a specific department",
    parameters: {
      type: "object",
      properties: {
        department: {
          type: "string",
          enum: ["underwriting", "tech_support", "sales_quotes"],
          description: "The department to check agent wait time for",
        },
      },
      required: ["department"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "ask_virtual_underwriter",
    strict: true,
    description:
      "Submit a concise underwriting question for asynchronous review. Returns `pending` immediately; the completed UnderwriterAnswer will be injected into system instructions when ready.",
    parameters: {
      type: "object",
      properties: {
        userId: {
          type: "string",
          description: "The userId of the person you're speaking to.",
        },
        formName: {
          type: "string",
          enum: [FORM_NAME_1, FORM_NAME_2],
          description: "ID of the form page to open.",
        },
        summary: {
          type: "string",
          description:
            "One-sentence overview of the borrower scenario (e.g., 'Self-employed borrower reports 200 % YoY income spike').",
        },
        instructions: {
          type: "string",
          description:
            "Precise task for the underwriter (e.g., 'Determine if single-year income can be used and list any required documentation').",
        },
      },
      required: ["userId", "formName", "summary", "instructions"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "request_screen_control_permission",
    strict: true,
    description:
      "Trigger a permission prompt asking the caller to allow the AI assistant to view and control their current screen session. Must be invoked **before** any remote-control action is attempted. NO_FILLER_PHRASES",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description:
            "A concise, user-friendly explanation of why screen control is needed (e.g., “to walk you through form X” or “to troubleshoot the settings panel”).",
        },
        scope: {
          type: "string",
          enum: ["view_only", "view_and_control"],
          description: "The level of access being requested.",
        },
      },
      required: ["reason", "scope"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "switch_language",
    strict: true,
    description:
      "Switch the assistant's spoken and understanding language to the requested or detected language. Use this function only when the user requests or is detected to be speaking in a different language.",
    parameters: {
      type: "object",
      properties: {
        language: {
          type: "string",
          description:
            "The BCP-47 language code to switch to, 'en-AU', 'zh-CN'. This value must match one of the supported codes defined in the system prompt. ",
          enum: ["en-AU", "zh-CN"],
        },
      },
      required: ["language"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "navigate_to_form_page",
    strict: true,
    description:
      "Navigate the user's screen to one of the demo form pages. NO_FILLER_PHRASES",
    parameters: {
      type: "object",
      properties: {
        formName: {
          type: "string",
          enum: [FORM_NAME_1, FORM_NAME_2],
          description: "ID of the form page to open.",
        },
        userId: {
          type: "string",
          description: "The userId of the person you're speaking to.",
        },
      },
      required: ["formName", "userId"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "update_form_fields",
    strict: true,
    description:
      "Update one or more fields on a user form using dot- or bracket-notation paths. DO NOT INCLUDE FILLER PHRASES WHEN EXECUTING THIS TOOL!. ",
    parameters: {
      type: "object",
      properties: {
        formName: {
          type: "string",
          enum: [FORM_NAME_1, FORM_NAME_2],
          description: "Identifier of the form to update.",
        },
        updates: {
          type: "array",
          description: "List of updates; each targets a single field.",
          items: {
            type: "object",
            properties: {
              path: {
                type: "string",
                description:
                  "Path of the field to change (e.g. 'borrower_address.city' or 'income[0].monthly_income').",
              },
              value: {
                description:
                  "New value for the field. If you pass objects or arrays as a string they must be valid JSON.",
                anyOf: [
                  { type: "string" },
                  { type: "number" },
                  { type: "boolean" },
                  { type: "object", additionalProperties: false },
                  {
                    type: "array",
                    items: { type: "object", additionalProperties: false },
                  },
                ],
              },
            },
            required: ["path", "value"],
            additionalProperties: false,
          },
        },
      },
      required: ["formName", "updates"],
      additionalProperties: false,
    },
  },

  {
    type: "function",
    name: "handoff_to_twiml",
    strict: true,
    description:
      "Transfer the current conversation to an person or end the conversation. This tool is used to handoff the conversation to a human agent or end the conversation.",
    parameters: {
      type: "object",
      properties: {
        destination: {
          type: "string",
          enum: ["agent", "end"],
          description:
            "If asked to handover to a human agent, use 'agent'. If asked to end the conversation, use 'end'.",
        },
      },
      required: ["destination"],
      additionalProperties: false,
    },
  },

  // {
  //   type: "function",
  //   name: "update_form_fields",
  //   strict: true,
  //   description: "Apply one or more field updates to a user form.",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       formName: {
  //         type: "string",
  //         enum: [FORM_NAME_1, FORM_NAME_2],
  //         description: "Identifier of the form to update.",
  //       },
  //       updates: {
  //         type: "array",
  //         description: "List of updates; each targets a single field.",
  //         items: {
  //           type: "object",
  //           properties: {
  //             path: {
  //               type: "string",
  //               description:
  //                 'Dot-notation path of the field to change (e.g., "borrower_address.city").',
  //             },
  //             value: {
  //               description: "New value for the field.",
  //               anyOf: [
  //                 { type: "string" },
  //                 { type: "number" },
  //                 { type: "boolean" },
  //               ],
  //             },
  //           },
  //           required: ["path", "value"],
  //           additionalProperties: false,
  //         },
  //       },
  //     },
  //     required: ["formName", "updates"],
  //     additionalProperties: false,
  //   },
  // },
];

export const deriveToolManifest = (context: SessionContextStore) => {
  // todo: add filtering based on current context
  return tools;
};
