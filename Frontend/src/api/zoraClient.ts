export type ZoraDirection = "up" | "down";

export interface ZoraChatPayload {
  sessionId: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  speed: "slow" | "normal" | "fast";
}

export interface ZoraChatResponse {
  messageId: string;
  content: string;
  model?: string;
  latencyMs?: number;
}

export interface ZoraFeedbackPayload {
  messageId: string;
  sessionId: string;
  direction: ZoraDirection;
  model?: string;
  latencyMs?: number;
  role?: "user" | "assistant";
  createdAt?: string;
}

export interface ZoraSharePayload {
  messageId: string;
}

const ZORA_API_BASE = "/api/zora";

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Zora API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function callZoraChat(
  payload: ZoraChatPayload,
): Promise<ZoraChatResponse> {
  const res = await fetch(`${ZORA_API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson<ZoraChatResponse>(res);
}

export async function sendZoraFeedback(
  payload: ZoraFeedbackPayload,
): Promise<void> {
  const res = await fetch(`${ZORA_API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await handleJson<{}>(res);
}

export interface ZoraShareResponse {
  url: string;
}

export async function createZoraShareLink(
  payload: ZoraSharePayload,
): Promise<ZoraShareResponse> {
  const res = await fetch(`${ZORA_API_BASE}/share`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson<ZoraShareResponse>(res);
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
