export interface VectorSearchResult {
  score: number;
  document: VectorRecord;
}

export interface VectorRecord {
  id: string;
  callSid: string;
  active: boolean;
  feedback: string;
  summary: string;
  topics: string[];
}
