import type { SessionContext } from "../../common/session-context.js";
import { shallowDiff } from "../../common/utils/diff.js";
import type { DeepReadonly } from "../../common/utils/read-only.js";
import { TypedEventEmitter } from "../../common/utils/typed-event-emitter.js";
import { getMakeWebsocketLogger, type WebsocketLogger } from "../logger.js";

export interface SessionContextStore extends DeepReadonly<SessionContext> {}

export class SessionContextStore {
  private state: Readonly<SessionContext>;
  private eventEmitter = new TypedEventEmitter<SessionContextEvents>();
  private log: WebsocketLogger;

  constructor(context: SessionContext) {
    this.log = getMakeWebsocketLogger(context.setup.callSid);

    this.state = Object.freeze({ ...context });

    this.eventEmitter.emit("contextUpdated", {
      context,
      prev: undefined,
      keys: Object.keys(context) as (keyof SessionContext)[],
    });

    // Return a Proxy that exposes context fields on the instance but keeps them readonly.
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        // Prefer class methods / fields first (update, on, …)
        if (prop in target) return Reflect.get(target, prop, receiver);
        return (this.state as any)[prop];
      },

      set() {
        throw new Error(`SessionContextStore properties are read-only.`);
      },

      deleteProperty() {
        throw new Error("SessionContextStore properties are read-only.");
      },
    }) as unknown as SessionContextStore;
  }

  keys = () => Object.keys(this.state) as (keyof SessionContext)[];

  /** Replace parts of the context (immutably). */
  update = (
    partial:
      | Partial<SessionContext>
      | ((state: Readonly<SessionContext>) => Partial<SessionContext>), // callback, update((prev) => ({ call: { ...prev.call, status: "complete" } }))
    emit = true,
  ): void => {
    const prev = this.state;

    const update = typeof partial === "function" ? partial(prev) : partial;

    const context = Object.freeze({ ...prev, ...update });

    const keys = shallowDiff(prev, context);
    if (!keys.length) return; // no differences – abort

    this.state = context;
    this.log.info("context", `context updated: ${keys.join(", ")}`);
    if (emit)
      this.eventEmitter.emit("contextUpdated", {
        context,
        prev: { ...prev },
        keys,
      });
  };

  // ────────────────────────────────────────────────────────────────────────
  // Event helpers
  // ────────────────────────────────────────────────────────────────────────
  public on: (typeof this.eventEmitter)["on"] = (...args) =>
    this.eventEmitter.on(...args);
}

interface SessionContextEvents {
  contextUpdated: (payload: {
    context: Partial<SessionContext>;
    prev?: Partial<SessionContext>;
    keys: (keyof SessionContext)[];
  }) => void;
}
