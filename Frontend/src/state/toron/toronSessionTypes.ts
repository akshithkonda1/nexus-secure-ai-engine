export type ToronRole = "user" | "assistant" | "system";

export interface ToronMessage {
  id: string;
  role: ToronRole;
  content: string;
  model: string;
  timestamp: string;
}

export interface ToronSessionSummary {
  sessionId: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  firstMessageTitle?: string | null;
  titleAutoLocked?: boolean;
}

export interface ToronSession extends ToronSessionSummary {
  messages: ToronMessage[];
}
