export type ToronSender = "user" | "toron";

export interface ToronMessage {
  id: string;
  sender: ToronSender;
  text: string;
  timestamp: string;
}

export interface ToronSessionSummary {
  sessionId: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ToronSession extends ToronSessionSummary {
  messages: ToronMessage[];
}
