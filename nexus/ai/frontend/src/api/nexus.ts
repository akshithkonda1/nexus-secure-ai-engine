export type NexusSource = { url: string; title?: string | null; snippet?: string | null };
export type NexusPhoto = { url: string; caption?: string | null };
export type NexusCode = { language?: string | null; code: string };

export type NexusResult = {
  answer: string;
  winner: string;
  winner_ref: { name: string; adapter?: string; endpoint?: string };
  participants: string[];
  code: NexusCode[];
  sources: NexusSource[];
  photos: NexusPhoto[];
  meta: {
    schema_version: string;
    policy?: string;
    latencies?: Record<string, number>;
    policy_scores?: Record<string, number>;
  };
};

const API_BASE = (import.meta as any).env?.VITE_NEXUS_API_BASE;

function parseRetryAfter(h: string | null): number | null {
  if (!h) return null;
  const s = parseInt(h, 10);
  return Number.isNaN(s) ? null : s;
}

export async function runNexus(
  prompt: string,
  opts?: { deadlineMs?: number; wantPhotos?: boolean }
) {
  if (!API_BASE) throw new Error("NEXUS API base is not configured (VITE_NEXUS_API_BASE).");
  const res = await fetch(`${API_BASE}/debate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      deadline_ms: opts?.deadlineMs,
      want_photos: !!opts?.wantPhotos,
    }),
  });

  if (!res.ok) {
    const errBody = await (async () => {
      try {
        return await res.json();
      } catch {
        return null;
      }
    })();
    const e: any = new Error(errBody?.message || `HTTP ${res.status}`);
    e.status = res.status;
    e.code = errBody?.code;
    e.details = errBody?.details;
    e.retryAfter = parseRetryAfter(res.headers.get("retry-after"));
    throw e;
  }

  const data = (await res.json()) as NexusResult;
  return data;
}
