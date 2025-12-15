import { FormEvent, useMemo, useRef, useState } from "react";

const initialMessages = [
  { role: "system" as const, content: "Toron is ready. Keep prompts concise." },
  { role: "user" as const, content: "Summarize yesterday's workspace updates." },
  { role: "system" as const, content: "Workspace updates: research outline refined, notifications reviewed." },
];

export default function ToronPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const thread = useMemo(
    () =>
      messages.map((message, index) => (
        <div
          key={message.content + index}
          className={`rounded-xl border border-[var(--line-subtle)] px-4 py-3.5 ${
            message.role === "user"
              ? "bg-[var(--layer-surface)]"
              : "bg-[var(--layer-muted)]"
          }`}
        >
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            {message.role === "user" ? "User" : "System"}
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-primary)]">{message.content}</p>
        </div>
      )),
    [messages]
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = input.trim();
    if (!next) return;
    setMessages((prev) => [...prev, { role: "user" as const, content: next }]);
    setInput("");
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <section className="flex flex-1 flex-col">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold leading-tight text-[var(--text-strong)]">Chat without distractions</h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Messages stay in one column. The input stays docked to the bottom of the canvas.
        </p>
      </header>

      <div className="relative flex flex-1 flex-col">
        <div className="flex flex-col gap-3 overflow-y-auto pb-40">
          {thread}
        </div>
        <form
          onSubmit={handleSubmit}
          className="absolute bottom-0 left-0 right-0 rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-4"
        >
          <label className="sr-only" htmlFor="toron-input">
            Toron prompt
          </label>
          <textarea
            id="toron-input"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type a prompt..."
            className="h-24 w-full resize-none bg-transparent text-sm leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
          <div className="flex items-center justify-between pt-3 text-xs text-[var(--text-muted)]">
            <span>Press Enter to send</span>
            <button
              type="submit"
              className="rounded-lg bg-[var(--layer-active)] px-3.5 py-2 text-sm font-medium text-[var(--text-strong)] hover:bg-[var(--layer-muted)]"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
