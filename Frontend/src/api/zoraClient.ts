export type ToronDirection = "up" | "down";

export interface ToronChatPayload {
  sessionId: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  speed: "slow" | "normal" | "fast";
}

export interface ToronChatResponse {
  messageId: string;
  content: string;
  model?: string;
  latencyMs?: number;
}

export interface ToronFeedbackPayload {
  messageId: string;
  sessionId: string;
  direction: ToronDirection;
  model?: string;
  latencyMs?: number;
  role?: "user" | "assistant";
  createdAt?: string;
}

export interface ToronSharePayload {
  messageId: string;
}

const ZORA_API_BASE = "/api/zora";

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Ryuzen API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function callToronChat(
  payload: ToronChatPayload,
): Promise<ToronChatResponse> {
  const res = await fetch(`${ZORA_API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson<ToronChatResponse>(res);
}

export async function sendToronFeedback(
  payload: ToronFeedbackPayload,
): Promise<void> {
  const res = await fetch(`${ZORA_API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await handleJson<{}>(res);
}

export interface ToronShareResponse {
  url: string;
}

export async function createToronShareLink(
  payload: ToronSharePayload,
): Promise<ToronShareResponse> {
  const res = await fetch(`${ZORA_API_BASE}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson<ToronShareResponse>(res);
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
