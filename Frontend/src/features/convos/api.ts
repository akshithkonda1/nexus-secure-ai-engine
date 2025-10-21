const API = (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/,'') || "";
export const ASK_SSE = `${API}/api/ask/stream`;
export const ASK_JSON = `${API}/api/ask`;

export type PatchFn = (content: string, meta?: any) => void;

export async function askSSE(body: any, headers: Record<string, string>, patch: PatchFn, signal: AbortSignal) {
  const res = await fetch(ASK_SSE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal
  });
  if (!res.ok || !res.headers.get("content-type")?.includes("text/event-stream")) {
    throw new Error("no-sse");
  }
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buffer = "";
  let full = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += dec.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";
    for (const block of chunks) {
      const m = block.match(/^data:\s*(.*)$/m);
      if (!m) continue;
      const data = m[1];
      if (data === "[DONE]") return;
      try {
        const obj = JSON.parse(data);
        if (obj.delta) {
          full += obj.delta;
          patch(full, obj);
        }
      } catch {
        full += data;
        patch(full);
      }
    }
  }
}

export async function askJSON(body: any, headers: Record<string, string>, patch: PatchFn) {
  const r = await fetch(ASK_JSON, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  const answer = String(j.answer ?? j.output ?? j.text ?? "");
  patch(answer, j);
}
