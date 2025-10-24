export const SYSTEM_FEEDBACK_CHAR_LIMIT = 15_000;

interface FeedbackPayload {
  score: number;
  note: string;
  route: string;
}

export async function sendFeedback(payload: FeedbackPayload): Promise<boolean> {
  const token = (import.meta as any).env?.VITE_ALPHA_TOKEN ?? "";
  const res = await fetch("/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-alpha-token": token,
    },
    body: JSON.stringify({
      ...payload,
      ts: Date.now(),
      ua: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    }),
  });
  return res.ok;
}
