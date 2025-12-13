export type ToronRole = "user" | "assistant" | "system";

export interface ToronAttachment {
  id: string;
  name: string;
  type: string;
  size?: number;
  previewUrl?: string;
  source?: "upload" | "drive" | "github";
}

export interface ToronMessage {
  id: string;
  role: ToronRole;
  content: string;
  model: string;
  timestamp: string;
  attachments?: ToronAttachment[];
  meta?: {
    browsing?: boolean;
    agentMode?: boolean;
    editedFromId?: string;
  };
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
