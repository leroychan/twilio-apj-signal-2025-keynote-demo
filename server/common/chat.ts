export interface ChatMessageRecord {
  id: string;
  role: "user" | "bot";
  message: string;
  dateCreated: string; // iso-date
}
