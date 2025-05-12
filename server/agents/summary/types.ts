export interface CallSummary {
  current: string; // 1 sentence describing what is happening at the moment. Look at the last few sentences and describe what is currently happening.
  title: string; // 1 sentence title of the call
  description: string; // 2-3 paragraph description
  topics: string[]; // at most 2 topic ids at a time
  sentiment: "negative" | "neutral" | "positive";
}
