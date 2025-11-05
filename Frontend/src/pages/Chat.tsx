// src/pages/ChatPage.tsx
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Paperclip,
  Sparkles,
  Send,
  Image as ImageIcon,
  X,
  Copy,
  Check,
  Zap,
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
      <div className="relative max-w-xl px-5 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-ink text-sm leading-relaxed">
        <div className="prose prose-sm prose-invert max-w-none">
          {m.text}
        </div>
        <button
          onClick={copy}
          className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white opacity-0 hover:opacity-100 transition"
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
      className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs text-ink border border-white/20"
    >
      {isImage(a.type) && a.previewUrl ? (
        <img src={a.previewUrl} alt="" className="h-5 w-5 rounded-full object-cover ring-1 ring-white/30" />
      ) : (
        <Paperclip className="h-3.5 w-3.5" />
      )}
      <span className="max-w-32 truncate font-medium">{a.name}</span>
      <button onClick={() => onRemove(a.id)} className="p-1 text-ink/70 hover:text-ink">
        <X className="h-3 w-3" />
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
    const height = Math.min(160, el.scrollHeight);
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
      Array.from(files).forEach(f => {
        const attach: Attach = {
          id: uid(),
          file: f,
          name: f.name,
          type: f.type,
          size: f.size,
          previewUrl: isImage(f.type) ? URL.createObjectURL(f) : undefined,
        };
        setAttachments(p => [...p, attach]);
      });
    };
    window.addEventListener("nexus:attach", onAttach as EventListener);
    return () => window.removeEventListener("nexus:attach", onAttach as EventListener);
  }, []);

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const removed = prev.find(a => a.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter(a => a.id !== id);
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text && !attachments.length) return;

    const userMsg: Msg = { id: uid(), role: "user", text: text || "(Attachment)", ts: Date.now() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setAttachments([]);
    setBusy(true);

    await new Promise(r => setTimeout(r, 800));
    const reply: Msg = {
      id: uid(),
      role: "assistant",
      text: `**Nexus Consensus**\n\n> ${text}\n\n**3 sources verified.**\n\n• NASA\n• UN\n• IPCC\n\n*Debate complete.*`,
      ts: Date.now(),
    };
    setMessages(m => [...m, reply]);
    setBusy(false);
  };

  return (
    <div className="flex h-screen flex-col bg-app text-ink">
      {/* ——— TOP BAR ——— */}
      <header className="relative z-50 border-b border-white/10 bg-app/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Left: Logo + Search */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">Nexus</span>
              <span className="rounded-full bg-trustBlue/20 px-2 py-0.5 text-xs text-trustBlue font-medium">BETA</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-sm text-ink/70">
              <Sparkles className="h-4 w-4 text-trustBlue" />
              <span>What are you looking for?</span>
            </div>
          </div>

          {/* Center: Nexus Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-trustBlue animate-pulse" />
            <span className="text-sm font-medium text-white">Nexus</span>
          </div>

          {/* Right: Status + Waitlist */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-ink/70">Ready</span>
            <button className="rounded-full bg-trustBlue px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-trustBlue/30 transition hover:shadow-xl hover:shadow-trustBlue/40">
              Join Waitlist
            </button>
          </div>
        </div>
      </header>

      {/* ——— MESSAGES ——— */}
      <div className="flex-1 overflow-y-auto px-6 py-12">
        <div className="mx-auto max-w-3xl space-y-8">
          <AnimatePresence>
            {messages.map(m => (
              <MessageBubble key={m.id} m={m} />
            ))}
            {busy && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md px-5 py-3.5 border border-white/10">
                  <Loader2 className="h-5 w-5 animate-spin text-trustBlue" />
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
              <motion.div layout className="mb-3 flex flex-wrap gap-2">
                {attachments.map(a => (
                  <AttachmentChip key={a.id} a={a} onRemove={removeAttachment} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <textarea
                ref={taRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything. Get truth."
                className="w-full resize-none rounded-2xl bg-white/10 backdrop-blur-md px-5 py-4 text-base text-ink placeholder:text-ink/50 border border-white/20 focus:border-trustBlue/50 focus:ring-4 focus:ring-trustBlue/20 outline-none transition-all"
                rows={1}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-ink/70 hover:text-ink hover:bg-white/20 transition">
                <Paperclip className="h-5 w-5" />
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-ink/70 hover:text-ink hover:bg-white/20 transition">
                <Mic className="h-5 w-5" />
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={send}
                disabled={busy || (!input.trim() && !attachments.length)}
                className="grid h-10 w-10 place-items-center rounded-full bg-trustBlue text-white shadow-lg shadow-trustBlue/30 transition disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Hint */}
          <p className="mt-2 text-center text-xs text-ink/50">
            CTRL + ENTER to send
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
