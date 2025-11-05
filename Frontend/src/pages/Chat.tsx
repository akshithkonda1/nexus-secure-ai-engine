// src/pages/ChatPage.tsx
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Paperclip, Send, X, Copy, Check } from "lucide-react";

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

const uid = () => Math.random().toString(36).slice(2);
const isImage = (t: string) => /^image\//.test(t);

/* ─────────────────────────────
   Message bubble (iMessage vibe)
   ───────────────────────────── */
function MessageBubble({ m }: { m: Msg }) {
  const mine = m.role === "user";
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(m.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={[
          "relative max-w-[78ch] whitespace-pre-wrap leading-relaxed text-[15px] shadow-md",
          "px-4 py-2.5 rounded-2xl",
          mine
            ? "bg-[#0B93F6] text-white rounded-tr-none"
            : "bg-[#E5E5EA] text-black dark:bg-white/10 dark:text-ink rounded-tl-none border border-black/5 dark:border-white/10",
        ].join(" ")}
      >
        {m.text}

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
function AttachmentChip({
  a,
  onRemove,
}: {
  a: Attach;
  onRemove: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 rounded-full bg-black/5 dark:bg-white/10 px-3 py-1.5 text-xs text-ink border border-black/10 dark:border-white/15"
    >
      {isImage(a.type) && a.previewUrl ? (
        <img
          src={a.previewUrl}
          alt=""
          className="h-5 w-5 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/20"
        />
      ) : (
        <Paperclip className="h-3.5 w-3.5" />
      )}
      <span className="max-w-40 truncate font-medium">{a.name}</span>
      <button
        onClick={() => onRemove(a.id)}
        className="p-1 text-ink/70 hover:text-ink"
        aria-label="Remove attachment"
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
   Main ChatPage (no top bar)
   ───────────────────────────── */
export function ChatPage() {
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: uid(),
      role: "system",
      ts: Date.now(),
      text: "Welcome to **Chat**. Ask anything.\n\nEvidence. Synthesis. Less noise.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [attachments, setAttachments] = React.useState<Attach[]>([]);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  useAutogrow(taRef, input);

  // Also accept external "nexus:attach" events (keeps old integration working)
  React.useEffect(() => {
    const onAttach = (e: Event) => {
      const files = (e as CustomEvent<FileList>).detail;
      if (files) addFiles(files);
    };
    window.addEventListener("nexus:attach", onAttach as EventListener);
    return () => window.removeEventListener("nexus:attach", onAttach as EventListener);
  }, []);

  const addFiles = (files: FileList) => {
    Array.from(files).forEach((f) => {
      const attach: Attach = {
        id: uid(),
        file: f,
        name: f.name,
        type: f.type,
        size: f.size,
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

    const userMsg: Msg = {
      id: uid(),
      role: "user",
      text: text || "(Attachment)",
      ts: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setAttachments([]);
    setBusy(true);

    // Demo assistant reply
    await new Promise((r) => setTimeout(r, 750));
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
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-2xl space-y-3 sm:space-y-4">
          <AnimatePresence>
            {messages.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
            {busy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="rounded-2xl bg-[#E5E5EA] text-black dark:bg-white/10 dark:text-ink px-4 py-2.5 border border-black/5 dark:border-white/10">
                  Typing…
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Composer (iMessage-like) */}
      <div className="border-t border-black/5 dark:border-white/10 bg-app/80 backdrop-blur-xl">
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
            {/* Attach input (hidden) */}
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

            {/* Left buttons */}
            <button
              onClick={() => fileRef.current?.click()}
              className="grid h-10 w-10 place-items-center rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-ink/70 hover:text-ink transition"
              aria-label="Attach files"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Text input (pill) */}
            <div className="relative flex-1">
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="iMessage…"
                rows={1}
                className="w-full resize-none rounded-full bg-white text-black dark:bg-white/10 dark:text-ink placeholder:text-black/40 dark:placeholder:text-ink/50 px-4 py-2.5 pr-12 border border-black/10 dark:border-white/15 outline-none focus:ring-4 focus:ring-[#0B93F6]/20"
              />
              <div className="pointer-events-none absolute right-3 bottom-2 text-[10px] uppercase tracking-widest text-black/40 dark:text-ink/40">
                ⌘/Ctrl+Enter
              </div>
            </div>

            {/* Right buttons */}
            <button
              className="grid h-10 w-10 place-items-center rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-ink/70 hover:text-ink transition"
              aria-label="Voice"
            >
              <Mic className="h-5 w-5" />
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={send}
              disabled={busy || (!input.trim() && !attachments.length)}
              className="grid h-10 w-10 place-items-center rounded-full bg-[#0B93F6] text-white shadow disabled:opacity-50"
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
