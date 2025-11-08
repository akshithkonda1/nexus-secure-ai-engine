import { useState } from "react";
import { Send } from "lucide-react";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const m: Msg = { id: crypto.randomUUID(), role: "user", text: input.trim() };
    setMsgs((s) => [...s, m, { id: crypto.randomUUID(), role: "assistant", text: "Working on it…" }]);
    setInput("");
  };

  return (
    <div className="pt-20 pl-64 pr-6 pb-24">
      <div className="space-y-4 max-w-3xl">
        {msgs.map((m) => (
          <div key={m.id} className={`panel p-4 ${m.role === "user" ? "ml-auto max-w-[70%]" : "max-w-[80%]"}`}>
            <div className="text-sm opacity-70 mb-1">{m.role}</div>
            <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="fixed left-64 right-6 bottom-6">
        <div className="panel p-2 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask Me anything."
          />
          <button onClick={send} className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
