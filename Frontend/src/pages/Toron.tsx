import { FormEvent, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User as UserIcon, Sparkles } from "lucide-react";

const initialMessages = [
  { role: "assistant" as const, content: "Hello! I'm Toron, your AI assistant. How can I help you today?" },
  { role: "user" as const, content: "Summarize yesterday's workspace updates." },
  { role: "assistant" as const, content: "Based on your workspace activity, here are yesterday's key updates:\n\n• Research outline refined with 3 new sections\n• Notifications system reviewed and optimized\n• Team collaboration features enhanced\n\nWould you like more details on any of these items?" },
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
        className="mb-6 space-y-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-strong)]">Toron AI Chat</h1>
            <p className="text-xs text-[var(--text-muted)]">Conversational AI assistant</p>
          </div>
        </div>
      </motion.header>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4 pr-2">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <motion.div
                  className={`group relative max-w-[80%] rounded-xl px-4 py-3 border ${
                    message.role === "user"
                      ? "border-[var(--accent)] bg-[var(--pill)] text-[var(--text-strong)]"
                      : "border-[var(--line-subtle)] bg-[var(--layer-surface)] text-[var(--text-primary)]"
                  }`}
                  whileHover={{ scale: 1.01 }}
                >
                  <div
                    className={`mb-1 text-[10px] font-medium uppercase tracking-wide ${
                      message.role === "user" ? "text-[var(--text-muted)]" : "text-[var(--text-muted)]"
                    }`}
                  >
                    {message.role === "user" ? "You" : "Toron"}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </motion.div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-4 py-3">
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
                <span className="text-xs text-[var(--text-muted)]">Toron is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="mt-4 rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-4 transition-all focus-within:border-[var(--accent)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pill)] text-[var(--accent)]">
              <Sparkles className="h-5 w-5" />
            </div>
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
                placeholder="Ask Toron anything... (Shift+Enter for new line)"
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                rows={3}
              />
            </div>
            <motion.button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white transition-all disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ scale: input.trim() ? 1.03 : 1 }}
              whileTap={{ scale: input.trim() ? 0.97 : 1 }}
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-[var(--text-muted)]">
              Press <kbd className="rounded bg-[var(--layer-muted)] px-1.5 py-0.5 text-[10px]">Enter</kbd> to send • <kbd className="rounded bg-[var(--layer-muted)] px-1.5 py-0.5 text-[10px]">Shift+Enter</kbd> for new line
            </p>
            <span className="text-xs text-[var(--text-muted)]">{input.length} characters</span>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
