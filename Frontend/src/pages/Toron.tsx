import { FormEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const initialMessages: Message[] = [
  { role: "assistant", content: "Toron is active. State the objective." },
  { role: "user", content: "Summarize yesterday's workspace updates." },
  {
    role: "assistant",
    content:
      "Review complete. Yesterday's workspace highlights:\n\n• Research outline refined with 3 new sections\n• Notifications system reviewed and optimized\n• Team collaboration features enhanced\n\nSpecify where you want to dive deeper.",
  },
];

export default function ToronPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = input.trim();
    if (!next) return;

    setMessages((prev) => [...prev, { role: "user", content: next }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I understand your request. I'm processing this information and will provide a detailed response shortly.",
        },
      ]);
      setIsTyping(false);
    }, 1200);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <section className="flex flex-1 flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-[var(--text-strong)]">Toron</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">Precision dialogue for decisive action.</p>
      </header>

      <div className="flex flex-1 flex-col rounded-2xl border border-white/30 bg-white/65 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.07)] backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`w-full rounded-xl border px-4 py-3 text-base leading-relaxed backdrop-blur-md transition-colors duration-150 ${
                message.role === "user"
                  ? "border-white/40 bg-white/80 text-[var(--text-strong)] dark:border-white/10 dark:bg-white/10"
                  : "border-white/30 bg-white/65 text-[var(--text-primary)] dark:border-white/10 dark:bg-white/5"
              }`}
            >
              <div className="mb-1 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {message.role === "assistant" ? "Toron" : "You"}
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}

          {isTyping && (
            <div className="w-full rounded-xl border border-white/30 bg-white/65 px-4 py-3 text-base text-[var(--text-primary)] shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              Toron is typing…
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="toron-input" className="sr-only">
              Message Toron
            </label>
            <textarea
              id="toron-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-base text-[var(--text-strong)] shadow-inner backdrop-blur-md transition focus:border-[var(--primary)] focus:outline-none dark:border-white/10 dark:bg-white/10"
              placeholder="Type your request"
            />
          </div>
          <button
            type="submit"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            aria-label="Send message"
          >
            <Send size={16} aria-hidden />
            Send
          </button>
        </form>
      </div>
    </section>
  );
}

