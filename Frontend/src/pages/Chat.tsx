import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Paperclip, Send, Sparkles } from "lucide-react";

type Msg = { id: string; role: "user" | "assistant" | "system"; text: string };

const demoReply = (q: string) =>
  `Working on it… (mock)\n\nYou asked:\n> ${q}\n\nThis is where your debate/consensus response will render.`;

function Bubble({ m }: { m: Msg }) {
  const mine = m.role === "user";
  const sys = m.role === "system";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[75ch] whitespace-pre-wrap leading-relaxed",
          "rounded-2xl px-4 py-3 text-sm shadow-[0_10px_28px_rgba(0,0,0,0.22)]",
          sys
            ? "bg-surface/60 border border-border/60 text-subtle"
            : mine
            ? "text-white"
            : "bg-[rgb(var(--panel))] border border-border/60",
        ].join(" ")}
        style={mine ? { backgroundColor: "var(--brand)" } : undefined}
      >
        {m.text}
      </div>
    </div>
  );
}

export function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: "s1",
      role: "system",
      text: "Nexus orchestrates multiple models and records telemetry for trust.\nAsk anything to begin.",
    },
  ]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [msgs.length, busy]);

  async function send() {
    const text = q.trim();
    if (!text) return;
    const id = crypto.randomUUID();
    setMsgs((x) => [...x, { id, role: "user", text }]);
    setQ("");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 450));
    setMsgs((x) => [
      ...x,
      { id: crypto.randomUUID(), role: "assistant", text: demoReply(text) },
    ]);
    setBusy(false);
  }

  return (
    <div className="h-[calc(100vh-4rem)] grid grid-rows-[1fr_auto] gap-4">
      <div
        ref={scrollerRef}
        className="rounded-2xl bg-[rgb(var(--panel))] border border-border/60 p-6 overflow-y-auto shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {msgs.map((m) => (
            <Bubble key={m.id} m={m} />
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-subtle">
              <Loader2 className="size-4 animate-spin" /> generating…
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="rounded-2xl bg-[rgb(var(--panel))] border border-border/60 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
          <div className="px-4 pt-3">
            <div className="flex flex-wrap items-center gap-2 text-subtle">
              <button className="h-8 px-3 rounded-lg border border-border/60 hover:bg-surface/50 flex items-center gap-2">
                <Paperclip className="size-4" /> Attach
              </button>
              <button className="h-8 px-3 rounded-lg border border-border/60 hover:bg-surface/50 flex items-center gap-2">
                <Mic className="size-4" /> Voice
              </button>
              <button className="h-8 px-3 rounded-lg border border-border/60 hover:bg-surface/50 flex items-center gap-2">
                <Sparkles className="size-4" /> Browse Prompts
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 pb-4 pt-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Send a message…"
              className="flex-1 h-12 rounded-xl bg-panel/80 border border-border/60 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
            />
            <button
              onClick={send}
              disabled={!q.trim() || busy}
              className="h-12 px-4 rounded-xl text-white disabled:opacity-60"
              style={{ backgroundColor: "var(--brand)" }}
              title="Send"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
