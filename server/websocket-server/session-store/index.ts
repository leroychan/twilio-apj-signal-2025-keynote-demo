import { SessionContextParams } from "../../common/session-context.js";
import { omit } from "../../common/utils/omit.js";
import { SetupMessage } from "../twilio/conversation-relay-adapter.js";
import { SessionContextStore } from "./context-store.js";
import { SessionTurnStore } from "./turn-store.js";

export class SessionStore {
  readonly context: SessionContextStore;
  readonly turns: SessionTurnStore;

  constructor(setupMessage: SetupMessage, context: SessionContextParams) {
    const setup = omit(setupMessage, "customParameters");
    this.context = new SessionContextStore({ ...context, setup });
    this.turns = new SessionTurnStore(setup.callSid);
  }

  get callSid() {
    return this.context.setup.callSid;
  }
}
