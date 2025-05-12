export interface LLMInterface {
  run(): any;
  abort(): void;
  readonly isStreaming: boolean;

  on<K extends keyof LLMEvents>(event: K, listener: LLMEvents[K]): void;
}

export interface LLMEvents {
  dtmf: (digits: string) => void; // dtmf digits the bot wants to send
  text: (text: string, last: boolean, fullText?: string) => void; // chunk of text the LLM wants to say
}
