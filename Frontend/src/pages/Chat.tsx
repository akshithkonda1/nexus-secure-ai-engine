import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessageBubble } from "@/components/ChatMessage";
import { useChatStore, Attachment } from "@/hooks/useChatStore";
import { readJSON } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Sparkles, ArrowDown } from "lucide-react";

const SYSTEM_SUGGESTIONS = [
  "Summarize this chat into 3 crisp next steps.",
  "Turn today’s uploads into a Script.io workflow.",
  "Give me an anonymized executive recap.",
  "Map risks & dependencies as JSON.",
  "Explain this like I’m 12.",
  "Make a TikTok script from this convo.",
];

function pickRandom<T>(source: T[], count: number): T[] {
  const clone = [...source];
  const items: T[] = [];
  while (clone.length && items.length < count) {
    const index = Math.floor(Math.random() * clone.length);
    items.push(clone.splice(index, 1)[0]);
  }
  return items;
}

/* -------------------------------------------------
   Animated “N” fallback (no external component)
   ------------------------------------------------- */
function AnimatedN() {
  return (
    <motion.div
      initial={{ rotate: -10, scale: 0.9 }}
      animate={{ rotate: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand/70 shadow-xl"
    >
      <span className="text-5xl font-bold text-white drop-shadow-md">N</span>
    </motion.div>
  );
}

export default function ChatPage() {
  const messages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sending = useChatStore((state) => state.sending);
  const streamingMessage = useChatStore((state) => state.streamingMessage);

  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());

  /* ---------- Scroll-intent handling ---------- */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const check = () => {
      const near = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 150;
      setIsNearBottom(near);
      if (near) setNewMessagesCount(0);
    };

    check();
    const onScroll = () => check();
    viewport.addEventListener("scroll", onScroll);
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [messages]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (!isNearBottom && messages.length > 0) {
      setNewMessagesCount((c) => c + 1);
      return;
    }

    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
  }, [messages, streamingMessage, isNearBottom]);

  /* ---------- Keyboard shortcuts ---------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") inputRef.current?.blur();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ---------- Smart suggestions ---------- */
  const suggestions = useMemo(() => {
    if (typeof window === "undefined") return pickRandom(SYSTEM_SUGGESTIONS, 3);

    const stored = readJSON<{ title?: string; content?: string }[]>(
      window.localStorage.getItem("nexus.templates") ?? "",
      []
    )
      .map((t) => t.content || t.title)
      .filter(Boolean) as string[];

    const fromTemplates = pickRandom(stored.filter((s) => !usedSuggestions.has(s)), 2);
    const fromSystem = pickRandom(
      SYSTEM_SUGGESTIONS.filter((s) => !usedSuggestions.has(s)),
      3
    );

    return [...fromTemplates, ...fromSystem].slice(0, 4);
  }, [usedSuggestions]);

  const handleSuggestion = (s: string) => {
    sendMessage(s);
    setUsedSuggestions((prev) => new Set(prev).add(s));
  };

  const scrollToBottom = () => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    });
    setNewMessagesCount(0);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-background">
      {/* Gradient top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-48 bg-gradient-to-b from-brand/10 via-transparent to-transparent" />

      {/* Messages viewport */}
      <div
        ref={viewportRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 pb-32 pt-8 sm:px-12 scrollbar-thin scrollbar-thumb-muted/30"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          <AnimatePresence initial={false}>
            {messages.length === 0 && !streamingMessage ? (
              <EmptyState />
            ) : (
              <>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <ChatMessageBubble message={msg} />
                  </motion.div>
                ))}

                {streamingMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChatMessageBubble
                      message={{
                        id: "streaming",
                        role: "assistant",
                        content: streamingMessage,
                      }}
                      isStreaming
                    />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* New-messages badge */}
      <AnimatePresence>
        {newMessagesCount > 0 && !isNearBottom && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2"
          >
            <Button
              onClick={scrollToBottom}
              size="sm"
              variant="secondary"
              className="flex items-center gap-1.5 shadow-lg"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              {newMessagesCount} new {newMessagesCount === 1 ? "message" : "messages"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="sticky bottom-0 z-20 mx-auto w-full max-w-3xl px-4 pb-6 sm:px-12">
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl p-1.5">
          <ChatInput
            ref={inputRef}
            disabled={sending}
            suggestions={suggestions}
            onSend={({ text, files }) => {
              const attachments: Attachment[] = files.map((file) => ({
                id: crypto.randomUUID(),
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file),
              }));
              sendMessage(text, attachments);
            }}
            onSuggestionClick={handleSuggestion}
          />
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Press{" "}
          <kbd className="mx-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
            Cmd K
          </kbd>{" "}
          to focus •{" "}
          <kbd className="mx-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
            Esc
          </kbd>{" "}
          to dismiss
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   Empty state – TikTok viral gold (no logo)
   ------------------------------------------------- */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center h-full py-20 text-center"
    >
      {/* Glowing backdrop + animated N */}
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-3xl opacity-30">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-brand to-brand/50" />
        </div>
        <AnimatedN />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        Welcome to <span className="text-brand">Nexus</span>
      </h1>

      <p className="mt-3 max-w-md text-muted-foreground text-sm sm:text-base">
        Drop files, paste ideas, or just ask — I’ll connect the dots and make magic.
      </p>

      <div className="mt-8 flex flex-wrap gap-2 justify-center">
        {["Paste a link", "Upload a doc", "Ask anything"].map((tip, i) => (
          <motion.div
            key={tip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-brand" />
            {tip}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-10 text-xs text-muted-foreground/70"
      >
        Built for thinkers, creators, and doers.
      </motion.div>
    </motion.div>
  );
}
