// src/pages/ChatPage.tsx
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Paperclip, Send, X, Copy, Check } from "lucide-react";

/* ─────────────────────────────
   Types & helpers
   ───────────────────────────── */
type Role = "user" | "assistant" | "system";
type Msg  = { id: string; role: Role; text: string; ts: number };
type Attach = {
  id: string; file: File; name: string; type: string; size: number; previewUrl?: string;
};

const uid      = () => Math.random().toString(36).slice(2);
const isImage  = (t: string) => /^image\//.test(t);
const isMac    = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/* Smooth, consistent motion */
const msgVariants = {
  initial: { opacity: 0, y: 8, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 440, damping: 28, mass: 0.6 } },
};
const chipVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.15 } },
};

/* ─────────────────────────────
   Message bubble (theme-aligned)
   ───────────────────────────── */
function MessageBubble({ m }: { m: Msg }) {
  const mine = m.role === "user";
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(m.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  };

  if (m.role === "system") {
    return (
      <motion.div variants={msgVariants} initial="initial" animate="animate" className="flex justify-center">
        <div className="text-xs sm:text-[13px] text-muted bg-panel/70 border border-white/10 rounded-full px-3 py-1 backdrop-blur">
          {m.text}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={msgVariants} initial="initial" animate="animate" className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "group relative max-w-[78ch] whitespace-pre-wrap leading-relaxed text-[15px] shadow-md",
          "px-4 py-2.5 rounded-2xl",
          mine
            ? // User bubble = trustBlue gradient, on-brand
              "text-white bg-gradient-to-br from-trustBlue to-trustBlue/80 rounded-tr-none"
            : // Assistant bubble = panel tone, readable in dark/light
              "text-ink bg-panel/90 border border-white/10 rounded-tl-none backdrop-blur",
        ].join(" ")}
      >
        {m.text}

        <button
          onClick={copy}
          aria-label="Copy message"
          title="Copy"
          className={[
            "absolute -bottom-3",
            mine ? "right-2" : "left-2",
            "grid h-7 w-7 place-items-center rounded-full",
            "bg-white/15 text-white border border-white/25 backdrop-blur",
            "opacity-0 transition group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-trustBlue/50",
          ].join(" ")}
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
    <motion.div variants={chipVariants} initial="initial" animate="animate"
      className="flex items-center gap-2 rounded-full bg-app/60 border border-app/40 px-3 py-1.5 text-xs text-ink backdrop-blur">
      {isImage(a.type) && a.previewUrl ? (
        <img src={a.previewUrl} alt="" className="h-5 w-5 rounded-full object-cover ring-1 ring-white/20" />
      ) : (
        <Paperclip className="h-3.5 w-3.5" />
      )}
      <span className="max-w-40 truncate font-medium">{a.name}</span>
      <button onClick={() => onRemove(a.id)} aria-label="Remove attachment"
        className="p-1 rounded-full hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-trustBlue/40">
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
    const el = ref.current; if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(160, el.scrollHeight) + "px";
  }, [value]);
}

/* ─────────────────────────────
   Main ChatPage (no top bar)
   ───────────────────────────── */
export function ChatPage() {
  const [messages, setMessages] = React.useState<Msg[]>([
    { id: uid(), role: "system", ts: Date.now(), text: "Welcome to Chat. Evidence. Synthesis. Less noise." },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [attachments, setAttachments] = React.useState<Attach[]>([]);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  useAutogrow(taRef, input);

  // Smooth autoscroll to bottom on new content
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, attachments, busy]);

  // Legacy attach event support
  React.useEffect(() => {
    const onAttach = (e: Event) => {
      const files = (e as CustomEvent<FileList>).detail;
      if (files) addFiles(files);
    };
    window.addEventListener("nexus:attach", onAttach as EventListener);
    return () => window.removeEventListener("nexus:attach", onAttach as EventListener);
  }, []);

  // Drag & drop to attach
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };
  const allowDrop: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault();

  const addFiles = (files: FileList) => {
    Array.from(files).forEach((f) => {
      const attach: Attach = {
        id: uid(), file: f, name: f.name, type: f.type, size: f.size,
        previewUrl: isImage(f.type) ? URL.createObjectURL(f) : undefined,
      };
      setAttachments((p) => [...p, attach]);
    });
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

    const userMsg: Msg = { id: uid(), role: "user", text: text || "(Attachment)", ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setAttachments([]);
    setBusy(true);

    // Demo assistant reply
    await new Promise((r) => setTimeout(r, 650));
    const reply: Msg = {
      id: uid(),
      role: "assistant",
      ts: Date.now(),
      text: `**Consensus**\n\n> ${text || "Files received"}\n\nVerified by 3 sources.`,
    };
    setMessages((m) => [...m, reply]);
    setBusy(false);
  };

  return (
    <div className="flex h-screen flex-col bg-app text-ink">
      {/* Messages */}
      <div
        ref={scrollRef}
        onDrop={onDrop}
        onDragOver={allowDrop}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8"
      >
        <div className="mx-auto max-w-2xl space-y-3 sm:space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => <MessageBubble key={m.id} m={m} />)}
            {busy && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div
                  role="status" aria-live="polite"
                  className="flex items-center gap-2 rounded-2xl bg-panel/90 border border-white/10 px-3 py-2 text-sm text-muted backdrop-blur"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-trustBlue animate-bounce" />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-trustBlue animate-bounce" style={{ animationDelay: "120ms" }} />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-trustBlue animate-bounce" style={{ animationDelay: "240ms" }} />
                  <span className="sr-only">Typing…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-app/40 bg-panel/80 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6">
          {/* attachments row */}
          <AnimatePresence initial={false}>
            {attachments.length > 0 && (
              <motion.div layout className="mb-2.5 flex flex-wrap gap-2">
                {attachments.map((a) => (
                  <AttachmentChip key={a.id} a={a} onRemove={removeAttachment} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            {/* Hidden file input */}
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

            {/* Attach */}
            <button
              onClick={() => fileRef.current?.click()}
              className="grid h-10 w-10 place-items-center rounded-full border border-app/40 bg-app/60 text-ink/70 hover:text-ink transition focus:outline-none focus:ring-2 focus:ring-trustBlue/40"
              aria-label="Attach files"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Input (pill) */}
            <div className="relative flex-1">
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); send(); }
                }}
                placeholder="Message…"
                rows={1}
                className="w-full resize-none rounded-full bg-app px-4 py-2.5 pr-12 text-[15px] text-ink placeholder:text-muted border border-app/40 outline-none focus:ring-4 focus:ring-trustBlue/20 focus:border-trustBlue/60"
              />
              <div className="pointer-events-none absolute right-3 bottom-2 text-[10px] uppercase tracking-widest text-muted">
                {isMac ? "⌘" : "Ctrl"}+Enter
              </div>
            </div>

            {/* Voice (stub) */}
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-app/40 bg-app/60 text-ink/70 hover:text-ink transition focus:outline-none focus:ring-2 focus:ring-trustBlue/40"
              aria-label="Voice"
            >
              <Mic className="h-5 w-5" />
            </button>

            {/* Send */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={send}
              disabled={busy || (!input.trim() && !attachments.length)}
              className="grid h-10 w-10 place-items-center rounded-full bg-trustBlue text-white shadow-md shadow-trustBlue/20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-trustBlue/60"
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
