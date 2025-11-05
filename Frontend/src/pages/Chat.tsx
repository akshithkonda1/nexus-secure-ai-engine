// src/pages/ChatPage.tsx
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Paperclip,
  Send,
  Loader2,
  X,
  Copy,
  Check,
} from "lucide-react";

/** —————————————————————————————————
 * Types & Helpers
 * ————————————————————————————————— */
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

/** —————————————————————————————————
 * Message Bubble
 * ————————————————————————————————— */
function MessageBubble({ m }: { m: Msg }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(m.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center"
    >
      <div className="relative max-w-2xl px-6 py-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 text-ink text-base leading-relaxed shadow-lg">
        <div className="prose prose-invert max-w-none">{m.text}</div>
        <button
          onClick={copy}
          className="absolute -top-3 -right-3 grid h-8 w-8 place-items-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white opacity-0 hover:opacity-100 transition"
          aria-label={copied ? "Copied" : "Copy"}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </motion.div>
  );
}

/** —————————————————————————————————
 * Attachment Chip
 * ————————————————————————————————— */
function AttachmentChip({ a, onRemove }: { a: Attach; onRemove: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 text-sm text-ink border border-white/20"
    >
      {isImage(a.type) && a.previewUrl ? (
        <img
          src={a.previewUrl}
          alt=""
          className="h-6 w-6 rounded-full object-cover ring-1 ring-white/30"
        />
      ) : (
        <Paperclip className="h-4 w-4" />
      )}
      <span className="max-w-40 truncate font-medium">{a.name}</span>
      <button onClick={() => onRemove(a.id)} className="p-1 text-ink/70 hover:text-ink" aria-label="Remove attachment">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

/** —————————————————————————————————
 * Auto-grow Textarea
 * ————————————————————————————————— */
function useAutogrow(ref: React.RefObject<HTMLTextAreaElement>, value: string) {
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    const height = Math.min(200, el.scrollHeight);
    el.style.height = height + "px";
  }, [value]);
}

/** —————————————————————————————————
 * MAIN CHAT PAGE
 * ————————————————————————————————— */
export function ChatPage() {
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: uid(),
      role: "system",
      ts: Date.now(),
      text: "Welcome to **Nexus**. Ask anything. Get truth.\n\n*Evidence. Synthesis. Zero bias.*",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [attachments, setAttachments] = React.useState<Attach[]>([]);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  useAutogrow(taRef, input);

  // ——— Event Listeners ———
  React.useEffect(() => {
    const onAttach = (e: Event) => {
      const files = (e as CustomEvent<FileList>).detail;
      if (!files) return;
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
    window.addEventListener("nexus:attach", onAttach as EventListener);
    return () => window.removeEventListener("nexus:attach", onAttach as EventListener);
  }, []);

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
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

    await new Promise((r) => setTimeout(r, 1000));
    const reply: Msg = {
      id: uid(),
      role: "assistant",
      text: `**Nexus Consensus**\n\n> ${text}\n\n**3 sources verified.**\n\n• NASA\n• UN\n• IPCC\n\n*Debate complete.*`,
      ts: Date.now(),
    };
    setMessages((m) => [...m, reply]);
    setBusy(false);
  };

  return (
    <div className="flex h-screen flex-col bg-app text-ink">
      {/* ——— (Header removed as requested) ——— */}

      {/* ——— MESSAGES ——— */}
      <div className="flex-1 overflow-y-auto px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          <AnimatePresence>
            {messages.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
            {busy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <div className="rounded-3xl bg-white/10 backdrop-blur-md px-6 py-4 border border-white/10">
                  <Loader2 className="h-6 w-6 animate-spin text-trustBlue" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ——— COMPOSER ——— */}
      <div className="border-t border-white/10 bg-app/70 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-6 py-5">
          {/* Attachments */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div layout className="mb-4 flex flex-wrap gap-2">
                {attachments.map((a) => (
                  <AttachmentChip key={a.id} a={a} onRemove={removeAttachment} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input + Actions */}
          <div className="flex items-end gap-4">
            <div className="relative flex-1">
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e as any).isComposing) return;
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything. Get truth."
                className="w-full resize-none rounded-3xl bg-white/10 backdrop-blur-md px-6 py-4 pr-14 text-base text-ink placeholder:text-ink/50 border border-white/20 focus:border-trustBlue/50 focus:ring-4 focus:ring-trustBlue/20 outline-none transition-all"
                rows={1}
              />
              <div className="absolute bottom-3 right-3 text-xs uppercase tracking-widest text-ink/40 pointer-events-none">
                Ctrl+Enter
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="grid h-12 w-12 place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-ink/70 hover:text-ink hover:bg-white/20 transition"
                aria-label="Attach files"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <button
                className="grid h-12 w-12 place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-ink/70 hover:text-ink hover:bg-white/20 transition"
                aria-label="Record voice"
              >
                <Mic className="h-5 w-5" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={send}
                disabled={busy || (!input.trim() && !attachments.length)}
                className="grid h-12 w-12 place-items-center rounded-full bg-trustBlue text-white shadow-lg shadow-trustBlue/30 transition disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
