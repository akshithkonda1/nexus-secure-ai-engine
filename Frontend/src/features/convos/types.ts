export type Role = "user" | "assistant" | "system";
export type ModelAnswers = Record<string, string>;
export type AuditItem = Record<string, unknown>;

export type Message = {
  id: string;
  role: Role;
  content: string;
  html?: string;
  models?: ModelAnswers;
  audit?: AuditItem[];
};

export type ConversationStatus = "active" | "archived" | "trash";

export type Conversation = {
  id: string;
  title: string;
  status: ConversationStatus;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};
