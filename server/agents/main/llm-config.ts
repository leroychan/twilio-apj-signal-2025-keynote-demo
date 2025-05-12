import type { SessionContext } from "../../common/session-context.js";
import { AZURE_LLM_DEPLOYMENT } from "../../env.js";
import { SessionContextStore } from "../../websocket-server/session-store/context-store.js";

const config = {
  model: AZURE_LLM_DEPLOYMENT,
};

// todo: enable LLM runtime configuration based on context
export const deriveLLMConfig = (context: SessionContextStore) => ({
  ...config,
});
