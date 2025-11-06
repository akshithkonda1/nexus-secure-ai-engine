export type Role = "user" | "assistant" | "system";
export type Message = { id: string; role: Role; text: string; createdAt: number };
export type Attachment = { id: string; file: File; name: string; type: string; size: number; previewUrl?: string };
export type OutgoingPayload = {
  type: "user_message";
  sessionId: string;
  text: string;
  attachments?: { name: string; type: string; url?: string }[];
};
