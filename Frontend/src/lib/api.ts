export const API_URL = (import.meta as any).env.VITE_API_URL as string;

async function call(path: string, opts: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include", // httpOnly cookie sessions
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    signal: controller.signal,
    ...opts,
  });
  clearTimeout(t);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const api = {
  ask: (body: { prompt: string }) =>
    call("/ask", { method: "POST", body: JSON.stringify(body) }),
  feedback: (body: { answerId: string; rating: "up" | "down"; tag?: string }) =>
    call("/feedback", { method: "POST", body: JSON.stringify(body) }),
  events: (events: any[]) =>
    call("/events", { method: "POST", body: JSON.stringify({ events }) }),
};
