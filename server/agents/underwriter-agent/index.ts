import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";
import {
  UnderwriterAnswer,
  UnderwriterQuestion,
} from "../../common/session-context.js";
import { AZURE_CONN_STRING, UNDERWRITER_AGENT_ID } from "../../env.js";
import {
  getMakeWebsocketLogger,
  WebsocketLogger,
} from "../../websocket-server/logger.js";
import { SessionStore } from "../../websocket-server/session-store/index.js";
import { ThreadMessageCompleteEvent } from "./entities.js";

const client = new AIProjectClient(
  AZURE_CONN_STRING,
  new DefaultAzureCredential()
);

export class AgentUnderwriter {
  private log: WebsocketLogger;
  constructor(private store: SessionStore) {
    this.log = getMakeWebsocketLogger(store.callSid);
  }

  reviewApplication = async (args: UnderwriterQuestion) => {
    this.log.info("underwriter", "asking underwriter");

    const th = await client.agents.threads.create({
      messages: [
        {
          role: "user",
          content:
            `I am speaking to a customer right now. Please review the following request:` +
            JSON.stringify(args),
        },
      ],
    });

    const rawStream = await client.agents.runs
      .createThreadAndRun(UNDERWRITER_AGENT_ID, { thread: th })
      .stream();

    // SDK bug-work-around: force the right element type once, centrally
    const run =
      rawStream as unknown as AsyncIterable<ThreadMessageCompleteEvent>;

    let result: UnderwriterAnswer | undefined = undefined;
    for await (const ev of run) {
      if (ev.event === "thread.message.completed") {
        const value = ev.data.content?.[0].text.value;
        if (!value) this.log.error("underwriter", "not text received");

        result = JSON.parse(value) as UnderwriterAnswer;
      }
    }

    return result;
  };
}
