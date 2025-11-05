// src/pages/ChatPage.tsx
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Paperclip, Send, X, Copy, Check, ChevronDown } from "lucide-react";

/* ─────────────────────────────
   Types & helpers
   ───────────────────────────── */
type Role = "user" | "assistant" | "system";
type Msg = { id: string; role: Role; text: string; ts: number };
type Attach = {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
};

const MAX_INPUT_LENGTH = 4000;
const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const nid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const isImage = (t: string) => /^image\//.test(t);
const fmtTime = (t: number) =>
  new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(t);

// typed custom event for external drop-ins
declare global {
  interface WindowEventMap {
    "nexus:attach": CustomEvent<FileList>;
  }
}

/* ─────────────────────────────
   Typing dots (animated)
   ───────────────────────────── */
function TypingDots() {
  const dot = {
    initial: { y: 0, opacity: 0.5 },
    animate: (i: number) => ({
      y: [-2, 0, -2],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" },
    }),
  };
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          custom={i}
          variants={dot}
          initial="initial"
          animate="animate"
          className="block h-1.5 w-1.5 rounded-full bg-ink/70"
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────
   Message bubble (iMessage vibe)
   ───────────────────────────── */
function MessageBubble({ m }: { m: Msg }) {
  const mine = m.role === "user";
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(m.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // no-op: clipboard denied
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 30, mass: 0.6 }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
      aria-live="polite"
    >
      <div
        className={[
          "relative max-w-[78ch] whitespace-pre-wrap leading-relaxed text-[15px]",
          "px-4 py-2.5 rounded-2xl shadow-lg",
          mine
            ? "bg-gradient-to-br from-trustBlue to-blue-600 text-white rounded-tr-none"
            : "bg-app/60 text-ink rounded-tl-none border border-white/10 backdrop-blur",
        ].join(" ")}
      >
        {m.text}

        <div
          className={`mt-1.5 text-[10px] tracking-wide ${mine ? "text-white/70" : "text-ink/50"}`}
          aria-hidden="true"
        >
          {fmtTime(m.ts)}
        </div>

        <button
          onClick={copy}
          className={`absolute -bottom-3 ${mine ? "right-2" : "left-2"} grid h-7 w-7 place-items-center rounded-full
                     bg-black/10 dark:bg-white/15 backdrop-blur border border-black/10 dark:border-white/20
                     opacity-0 hover:opacity-100 transition`}
          aria-label="Copy message"
          title="Copy"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────
   Attachment chip
   ───────────────────────────── */
function AttachmentChip({ a, onRemove }: { a: Attach; onRemove: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 rounded-full bg-app/50 backdrop-blur px-3 py-1.5 text-xs text-ink border border-white/10"
    >
      {isImage(a.type) && a.previewUrl ? (
        <img
          src={a.previewUrl}
          alt=""
          className="h-5 w-5 rounded-full object-cover ring-1 ring-white/20"
        />
      ) : (
        <Paperclip className="h-3.5 w-3.5" />
      )}
      <span className="max-w-40 truncate font-medium">{a.name}</span>
      <button
        onClick={() => onRemove(a.id)}
        className="p-1 text-ink/70 hover:text-ink"
        aria-label={`Remove ${a.name}`}
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

/* ─────────────────────────────
   Auto-grow textarea
   ───────────────────────────── */
function useAutogrow(ref: React.RefObject<HTMLTextAreaElement>, value: string) {
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(160, el.scrollHeight) + "px";
  }, [value]);
}

/* ─────────────────────────────
   Main ChatPage
   ───────────────────────────── */
export function ChatPage() {
  const [messages, setMessages] = React.useState<Msg[]>(() => [
    {
      id: nid(),
      role: "system",
      ts: Date.now(),
      text: [
        "Welcome to Nexus. I’m loaded and ready to help.",
        "",
        "I orchestrate multiple AI models to debate your question while verifying with web sources in the background.",
        "Pure synthesis: less noise, more information.",
      ].join("\n"),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [attachments, setAttachments] = React.useState<Attach[]>([]);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const endRef = React.useRef<HTMLDivElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = React.useState(true);
  useAutogrow(taRef, input);

  // scroll state
  React.useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const onScroll = () => {
      const nearBottom =
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 40;
      setAtBottom(nearBottom);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  React.useEffect(() => {
    if (atBottom) scrollToBottom();
  }, [messages, busy, atBottom]);

  // external attach support
  React.useEffect(() => {
    const onAttach = (e: WindowEventMap["nexus:attach"]) => {
      const files = e.detail;
      if (files) addFiles(files);
    };
    window.addEventListener("nexus:attach", onAttach as EventListener);
    return () => window.removeEventListener("nexus:attach", onAttach as EventListener);
  }, []);

  // revoke object URLs on unmount
  React.useEffect(() => {
    return () => {
      attachments.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (files: FileList) => {
    const remaining = MAX_ATTACHMENTS - attachments.length;
    const slice = Array.from(files).slice(0, Math.max(0, remaining));

    const next: Attach[] = [];
    for (const f of slice) {
      if (f.size > MAX_FILE_SIZE) {
        console.warn(`File ${f.name} exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
        continue;
      }
      next.push({
        id: nid(),
        file: f,
        name: f.name,
        type: f.type,
        size: f.size,
        previewUrl: isImage(f.type) ? URL.createObjectURL(f) : undefined,
      });
    }
    if (next.length) setAttachments((p) => [...p, ...next]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const rm = prev.find((a) => a.id === id);
      if (rm?.previewUrl) URL.revokeObjectURL(rm.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text && !attachments.length) return;
    if (busy) return;

    const userMsg: Msg = {
      id: nid(),
      role: "user",
      text: text || "(Attachment)",
      ts: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);

    // clear input+attachments safely
    setInput("");
    setAttachments((prev) => {
      prev.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
      return [];
    });
    setBusy(true);

    // TODO: replace this demo reply with your real send → server → stream pipeline
    await new Promise((r) => setTimeout(r, 700));
    const reply: Msg = {
      id: nid(),
      role: "assistant",
      ts: Date.now(),
      text: `Consensus\n\n> ${text || "Files received"}\n\nVerified by 3 sources.`,
    };
    setMessages((m) => [...m, reply]);
    setBusy(false);
  };

  const canSend = !busy && (input.trim().length > 0 || attachments.length > 0);

  return (
    <div className="flex h-screen flex-col bg-app text-ink">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8"
        aria-busy={busy}
      >
        <div className="mx-auto max-w-2xl space-y-3 sm:space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}

            {busy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-2 rounded-2xl bg-app/60 border border-white/10 px-4 py-2.5 backdrop-blur">
                  <TypingDots />
                  <span className="text-sm text-ink/70">Typing…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>

        {/* scroll-to-latest when the user is reading history */}
        {!atBottom && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 rounded-full bg-panel/90 border border-white/10 backdrop-blur px-3 py-1 text-xs text-ink shadow hover:shadow-lg transition"
          >
            <span className="inline-flex items-center gap-1">
              <ChevronDown className="h-4 w-4" /> New messages
            </span>
          </button>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-white/10 bg-app/80 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6">
          {/* attachments row */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div layout className="mb-2.5 flex flex-wrap gap-2">
                {attachments.map((a) => (
                  <AttachmentChip key={a.id} a={a} onRemove={removeAttachment} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            {/* hidden file input */}
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                if (fileRef.current) fileRef.current.value = "";
              }}
            />

            {/* attach */}
            <button
              onClick={() => fileRef.current?.click()}
              className="grid h-10 w-10 place-items-center rounded-full bg-panel/80 border border-white/10 text-ink/70 hover:text-ink hover:bg-panel transition"
              aria-label="Attach files"
              disabled={attachments.length >= MAX_ATTACHMENTS}
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* text input (pill) */}
            <div className="relative flex-1">
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    if (canSend) send();
                  }
                }}
                placeholder="Message…"
                rows={1}
                aria-label="Message input"
                className="w-full resize-none rounded-full bg-white text-black dark:bg-white/10 dark:text-ink placeholder:text-black/40 dark:placeholder:text-ink/50 px-4 py-2.5 pr-12 border border-black/10 dark:border-white/15 outline-none focus:ring-4 focus:ring-trustBlue/25"
              />
              <div className="pointer-events-none absolute right-3 bottom-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-ink/40">
                ⌘/Ctrl+Enter
              </div>
            </div>

            {/* voice (stubbed) */}
            <button
              className="grid h-10 w-10 place-items-center rounded-full bg-panel/80 border border-white/10 text-ink/70 hover:text-ink hover:bg-panel transition"
              aria-label="Voice (coming soon)"
              disabled
              title="Coming soon"
            >
              <Mic className="h-5 w-5" />
            </button>

            {/* send */}
            <motion.button
              whileHover={canSend ? { scale: 1.05 } : {}}
              whileTap={canSend ? { scale: 0.95 } : {}}
              onClick={send}
              disabled={!canSend}
              className="grid h-10 w-10 place-items-center rounded-full bg-trustBlue text-white shadow-lg shadow-trustBlue/20 transition disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>

          {/* character counter near limit */}
          {input.length > MAX_INPUT_LENGTH * 0.9 && (
            <p className="mt-1 text-right text-[11px] text-ink/50">
              {input.length}/{MAX_INPUT_LENGTH}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
