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
          className={`rounded-2xl border border-[var(--line-subtle)] px-5 py-4 text-sm leading-relaxed ${
            message.role === "user"
              ? "bg-[var(--layer-surface)] text-[var(--text-primary)]"
              : "bg-[var(--layer-muted)] text-[var(--text-muted)]"
          }`}
        >
          <div className="mb-1 text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">
            {message.role === "user" ? "User" : "System"}
          </div>
          <p className="text-[var(--text-primary)]">{message.content}</p>
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
    <section className="flex flex-1 flex-col gap-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)]">Toron</p>
        <h1 className="text-[28px] font-semibold text-[var(--text-strong)]">Chat without distractions</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          Messages stay in one column. The input stays docked to the bottom of the canvas.
        </p>
      </header>

      <div className="relative flex min-h-[60vh] flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-32">
          {thread}
        </div>
        <form
          onSubmit={handleSubmit}
          className="absolute bottom-0 left-0 right-0 rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] p-5 shadow-[0_14px_30px_-24px_var(--ryuzen-cod-gray)]"
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
            className="h-28 w-full resize-none bg-transparent text-sm text-[var(--text-primary)] outline-none"
          />
          <div className="flex items-center justify-between pt-4 text-xs text-[var(--text-muted)]">
            <span>Press Enter to send</span>
            <button
              type="submit"
              className="rounded-xl border border-[var(--line-strong)] bg-[var(--layer-active)] px-4 py-2.5 text-sm font-medium text-[var(--text-strong)] hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
