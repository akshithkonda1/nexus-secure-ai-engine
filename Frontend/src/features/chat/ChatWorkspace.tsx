import { useState } from "react";
import { chatReply } from "@/services/api/client";

type Msg = { role: "user" | "assistant"; text: string };

export function ChatWorkspace() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  async function send() {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    const resp = await chatReply(q);
    setMessages((m) => [...m, { role: "assistant", text: resp }]);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.length === 0 && <div className="text-muted-foreground text-sm">Start a conversation.</div>}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-prose p-3 rounded-lg ${
              m.role === "user" ? "bg-primary/10" : "bg-muted/30"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask Nexus.ai anything…"
          className="flex-1 px-3 py-3 rounded-lg border outline-none"
        />
        <button onClick={send} className="px-4 py-3 rounded-lg bg-primary text-primary-foreground">
          Send
        </button>
      </div>
    </div>
  );
}
