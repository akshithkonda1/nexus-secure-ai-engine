import { useRef, useState } from "react";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "a1", role: "assistant", text: "Welcome to Nexus. Ask me anything." },
  ]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!text.trim()) return;
    const m: Msg = { id: crypto.randomUUID(), role: "user", text };
    setMsgs((prev) => [...prev, m, {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Working… (demo reply)\n\nThis will be your debate/consensus output.",
    }]);
    setText("");
    queueMicrotask(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }));
  };

  return (
    <main className="min-h-screen w-full grid grid-rows-[1fr_auto] gap-4">
      {/* Messages */}
      <div ref={listRef} className="overflow-auto pr-1">
        <div className="grid gap-3">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`glass px-4 py-3 whitespace-pre-wrap ${
                m.role === "user" ? "border border-[var(--brand)]/30" : ""
              }`}
            >
              <div className="text-xs text-subtle mb-1">{m.role}</div>
              <div className="leading-relaxed">{m.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="glass px-3 pt-3 pb-4">
        <div className="flex flex-wrap items-center gap-2 text-subtle px-1 pb-2">
          <button className="h-8 px-3 rounded-lg border border-border/60 hover:bg-surface/60">
            Attach
          </button>
          <button className="h-8 px-3 rounded-lg border border-border/60 hover:bg-surface/60">
            Voice
          </button>
          <button className="h-8 px-3 rounded-lg border border-border/60 hover:bg-surface/60">
            Browse Prompts
          </button>
        </div>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), send()) : null)}
            className="flex-1 h-12 rounded-full bg-surface/70 border border-border/60 px-5
                       focus-visible:outline-none focus-visible:ring-2 ring-[var(--brand)]"
            placeholder='Type “/compare” to launch a debate…'
          />
          <button onClick={send} className="h-12 px-5 rounded-full bg-prism lift">
            Send
          </button>
        </div>
      </div>
    </main>
  );
}

export default Chat;
