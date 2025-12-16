import { FormEvent, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus } from "lucide-react";

const initialMessages = [
  { role: "assistant" as const, content: "Toron is active. State the objective." },
  { role: "user" as const, content: "Summarize yesterday's workspace updates." },
  {
    role: "assistant" as const,
    content:
      "Review complete. Yesterday's workspace highlights:\n\n• Research outline refined with 3 new sections\n• Notifications system reviewed and optimized\n• Team collaboration features enhanced\n\nSpecify where you want to dive deeper.",
  },
];

export default function ToronPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = input.trim();
    if (!next) return;

    setMessages((prev) => [...prev, { role: "user" as const, content: next }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: "I understand your request. I'm processing this information and will provide a detailed response shortly.",
        },
      ]);
      setIsTyping(false);
      scrollToBottom();
    }, 1500);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      scrollToBottom();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <section className="flex flex-1 flex-col">
      <motion.header
        className="mb-8 space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-[var(--text-strong)]">Toron</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Precision dialogue for decisive action.</p>
          </div>
        </div>
      </motion.header>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-y-auto pb-6 pr-2">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const glassTone =
                message.role === "user"
                  ? "border-white/40 bg-white/75 text-[var(--text-strong)] shadow-[0_14px_38px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5"
                  : message.role === "system"
                    ? "border-white/25 bg-white/55 text-[var(--text-muted)] shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5"
                    : "border-white/30 bg-white/65 text-[var(--text-primary)] shadow-[0_12px_32px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/5";

              const textTone =
                message.role === "user"
                  ? "text-[var(--text-strong)]"
                  : message.role === "system"
                    ? "text-[var(--text-muted)]"
                    : "text-[var(--text-primary)]";

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <motion.div
                    className={`group relative w-full max-w-2xl rounded-2xl border px-5 py-4 backdrop-blur-md transition-all duration-200 ${glassTone}`}
                  >
                    <p className={`whitespace-pre-wrap text-base leading-relaxed ${textTone}`}>{message.content}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/65 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                <motion.div
                  className="flex gap-1"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                >
                  <div className="h-2 w-2 rounded-full bg-[var(--ryuzen-dodger)]" />
                  <div className="h-2 w-2 rounded-full bg-[var(--ryuzen-azure)]" />
                  <div className="h-2 w-2 rounded-full bg-[var(--ryuzen-purple)]" />
                </motion.div>
                <span className="text-xs text-[var(--text-muted)]">Toron is processing</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 w-full max-w-3xl rounded-2xl border border-white/30 bg-white/70 p-5 shadow-[0_16px_48px_rgba(15,23,42,0.12)] backdrop-blur-lg transition-all focus-within:border-[var(--accent)] focus-within:shadow-[0_18px_52px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/50 text-[var(--text-primary)] shadow-[0_8px_24px_rgba(15,23,42,0.1)] backdrop-blur-md transition-colors hover:border-white/50 dark:border-white/10 dark:bg-white/10"
              aria-label="Add context"
            >
              <Plus className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <label className="sr-only" htmlFor="toron-input">
                Toron prompt
              </label>
              <textarea
                id="toron-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a directive for Toron"
                className="w-full resize-none rounded-xl border border-transparent bg-white/50 px-4 py-3 text-base leading-relaxed text-[var(--text-primary)] outline-none backdrop-blur-sm placeholder:text-[var(--text-muted)] focus:border-white/40 dark:bg-white/10"
                rows={4}
              />
            </div>
            <motion.button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--color-accent-foreground)] transition-all hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={{ scale: input.trim() ? 1.03 : 1 }}
              whileTap={{ scale: input.trim() ? 0.97 : 1 }}
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
