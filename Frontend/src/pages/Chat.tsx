import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessageBubble } from "@/components/ChatMessage";
import { useChatStore } from "@/hooks/useChatStore";
import { Attachment } from "@/hooks/useChatStore";
import { readJSON } from "@/lib/utils";

const SYSTEM_SUGGESTIONS = [
  "Summarise this conversation into crisp next steps.",
  "Draft a Script.io-style workflow using today's uploads.",
  "Generate an anonymised executive recap with highlights.",
  "Map dependencies and risks as a JSON payload."
];

function pickRandom<T>(source: T[], count: number) {
  const clone = [...source];
  const items: T[] = [];
  while (clone.length && items.length < count) {
    const index = Math.floor(Math.random() * clone.length);
    items.push(clone.splice(index, 1)[0]);
  }
  return items;
}

/* ────────────────────────────────────────────────────────────── */
export default function ChatPage() {
  const messages = useChatStore((s) => s.messages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const sending = useChatStore((s) => s.sending);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Auto-scroll with a tiny delay for new animations
  useEffect(() => {
    const timer = setTimeout(() => {
      viewportRef.current?.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: "smooth"
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length]);

  const suggestions = useMemo(() => {
    if (typeof window === "undefined") return pickRandom(SYSTEM_SUGGESTIONS, 2);

    const stored = readJSON<{ title?: string; content?: string }[]>(
      window.localStorage.getItem("nexus.templates") ?? "",
      []
    )
      .map((t) => t.content || t.title)
      .filter(Boolean) as string[];

    return [...pickRandom(stored, 2), ...pickRandom(SYSTEM_SUGGESTIONS, 2)];
  }, []);

  return (
    <div
      className="relative flex h-full flex-col overflow-hidden bg-[rgb(var(--bg))] text-[rgb(var(--text))]"
    >

      {/* Messages viewport */}
      <div
        ref={viewportRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 pb-40 pt-6 sm:px-8"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{
                  layout: { duration: 0.2 },
                  opacity: { duration: 0.18 },
                  scale: { duration: 0.18 }
                }}
                className={idx === messages.length - 1 ? "mb-4" : ""}
              >
                <ChatMessageBubble message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator when sending */}
          {sending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] px-4 py-2 text-sm text-[color:rgba(var(--text)/0.75)]">
                <div className="flex space-x-1">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="inline-block h-2 w-2 rounded-full bg-[color:rgba(var(--text)/0.6)]"
                  />
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                    className="inline-block h-2 w-2 rounded-full bg-[color:rgba(var(--text)/0.6)]"
                  />
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                    className="inline-block h-2 w-2 rounded-full bg-[color:rgba(var(--text)/0.6)]"
                  />
                </div>
                <span>Thinking…</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sticky input bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="sticky bottom-0 z-20 mx-auto w-full max-w-2xl px-4 pb-6 sm:px-8"
      >
        <div className="relative">
          {/* Glassmorphic backdrop */}
          <div className="absolute inset-0 -m-2 rounded-3xl bg-[rgb(var(--surface))] shadow-[var(--elev-1)]" />

          <ChatInput
            disabled={sending}
            suggestions={suggestions}
            placeholder="Ask Nexus anything…"
            onSend={({ text, files }) => {
              const attachments: Attachment[] = files.map((f) => ({
                id: crypto.randomUUID(),
                name: f.name,
                size: f.size,
                type: f.type,
                url: URL.createObjectURL(f)
              }));
              sendMessage(text, attachments);
            }}
          />
        </div>

        {/* Suggestion chips (TikTok-style) */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex flex-wrap justify-center gap-2"
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage(s, [])}
                className="rounded-full border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-4 py-1.5 text-xs font-medium text-[color:rgba(var(--text)/0.8)] transition-colors hover:border-[color:var(--ring)] hover:text-[color:var(--ring)]"
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
