import { useState } from "react";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export default function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "a1", role: "assistant", text: "Welcome to Nexus. Ask me anything." },
  ]);
  const [text, setText] = useState("");
  return (
    <div className="p-6 grid grid-rows-[1fr_auto] h-full">
      <div className="overflow-auto grid gap-3">
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
      <div className="glass mt-3 p-3 flex gap-2">
        <input
          className="flex-1 h-11 rounded-full bg-surface/70 border border-border/60 px-4 focus:outline-none focus:ring-2 ring-[var(--brand)]"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type and press Enter…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim()) {
              setMsgs((p) => [...p, { id: crypto.randomUUID(), role: "user", text }]);
              setText("");
            }
          }}
        />
        <button className="h-11 px-5 rounded-full bg-prism">Send</button>
      </div>
    </main>
  );
}
