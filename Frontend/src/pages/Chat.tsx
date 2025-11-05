// src/pages/ChatPage.tsx
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Paperclip,
  Sparkles,
  Loader2,
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
const DEMO_REPLY = (q: string) =>
  `**Nexus Consensus**\n\n> ${q}\n\n**3 sources verified.**\n\n• NASA: Confirmed\n• UN: Aligned\n• IPCC: Cited\n\n*Debate complete.*`;

/** —————————————————————————————————
 * Floating Orb Bubble
 * ————————————————————————————————— */
function MessageBubble({ m }: { m: Msg }) {
  const mine = m.role === "user";
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(m.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          group relative max-w-lg px-5 py-4 rounded-3xl
          backdrop-blur-xl border border-white/10
          shadow-lg shadow-black/20
          ${mine 
            ? "bg-gradient-to-br from-trustBlue/90 to-trustBlue/70 text-white" 
            : "bg-white/10 text-ink"
          }
          transition-all duration-300 hover:shadow-2xl hover:shadow-trustBlue/20
        `}
      >
        <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
          {m.text}
        </div>

        {/* Copy Button — Floating */}
        <button
          onClick={copy}
          className={`
            absolute -top-3 ${mine ? "-left-3" : "-right-3"}
            grid h-8 w-8 place-items-center rounded-full
            bg-white/20 backdrop-blur-md border border-white/30
            text-white opacity-0 group-hover:opacity-100
            transition-all duration-200 hover:scale-110
          `}
          aria-label="Copy"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>

        {/* Subtle Glow */}
        <div className="absolute inset-0 rounded-3xl bg-trustBlue/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

/** —————————————————————————————————
 * Attachment Chip — Pill Glow
 * ————————————————————————————————— */
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
      <button
        onClick={() => onRemove(a.id)}
        className="rounded-full p-1 text-ink/70 hover:bg-white/20 hover:text-ink transition"
      >
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
  const [voicePartial, setVoicePartial] = React.useState<string | null>(null);
  const [attachments, setAttachments] = React.useState<Attach[]>([]);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  useAutogrow(taRef, input);

  // ——— Event Listeners (Voice, Attach, Prompt) ———
  React.useEffect(() => {
    const events: [string, (e: Event) => void][] = [
      ["nexus:prompt:insert", (e) => {
        const text = (e as CustomEvent).detail;
        setInput(v => v ? `${v} ${text}` : text);
        taRef.current?.focus();
      }],
      ["nexus:attach", (e) => {
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
          setInput(v => v ? `${v} ` : "" + `Attached: ${f.name}`);
        });
      }],
      ["nexus:voice:partial", (e) => setVoicePartial((e as CustomEvent).detail)],
      ["nexus:voice:data", (e) => {
        const { transcript } = (e as CustomEvent<{ transcript?: string }>).detail;
        if (transcript) setInput(v => v ? `${v} ${transcript}` : transcript);
        setVoicePartial(null);
      }],
    ];

    events.forEach(([name, handler]) =>
      window.addEventListener(name, handler as EventListener)
    );

    return () => events.forEach(([name, handler]) =>
      window.removeEventListener(name, handler as EventListener)
    );
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
    const reply: Msg = { id: uid(), role: "assistant", text: DEMO_REPLY(text), ts: Date.now() };
    setMessages(m => [...m, reply]);
    setBusy(false);
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-app via-app/95 to-app/90 text-ink">
      {/* ——— Header ——— */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-app/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-trustBlue animate-pulse" />
              <div className="absolute inset-0 blur-xl bg-trustBlue/50" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Nexus
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-ink/70">
            {busy ? (
              <>Generating <Zap className="ml-1 inline h-3 w-3 animate-pulse" /></>
            ) : voicePartial !== null ? (
              <>Listening <Mic className="ml-1 inline h-3 w-3 animate-bounce" /></>
            ) : (
              "Ready"
            )}
          </div>
        </div>
      </header>

      {/* ——— Messages ——— */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <AnimatePresence>
            {messages.map(m => (
              <MessageBubble key={m.id} m={m} />
            ))}
            {busy && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="rounded-3xl bg-white/10 backdrop-blur-md px-5 py-4 border border-white/10">
                  <Loader2 className="h-5 w-5 animate-spin text-trustBlue" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ——— Composer ——— */}
      <div className="sticky bottom-0 z-50 border-t border-white/10 bg-app/70 backdrop-blur-2xl">
        <div className="mx-auto max-w-5xl px-6 py-5">
          {/* Attachments */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                layout
                className="mb-3 flex flex-wrap gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {attachments.map(a => (
                  <AttachmentChip key={a.id} a={a} onRemove={removeAttachment} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Partial */}
          <AnimatePresence>
            {voicePartial && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-3 rounded-2xl bg-white/10 backdrop-blur-md px-4 py-2.5 text-sm text-ink/80 border border-white/10"
              >
                <Mic className="inline h-4 w-4 mr-2 animate-pulse" />
                {voicePartial}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input + Send */}
          <div className="flex items-end gap-3">
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
                className="w-full resize-none rounded-2xl bg-white/10 backdrop-blur-md px-5 py-4 pr-12 text-base text-ink placeholder:text-ink/50 border border-white/20 focus:border-trustBlue/50 focus:ring-4 focus:ring-trustBlue/20 outline-none transition-all"
                rows={1}
              />
              <div className="absolute bottom-2 right-3 text-[10px] uppercase tracking-widest text-ink/40 pointer-events-none">
                Ctrl+Enter
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={send}
              disabled={busy || (!input.trim() && !attachments.length)}
              className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-trustBlue to-trustBlue/80 text-white shadow-lg shadow-trustBlue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              )}
              <div className="absolute inset-0 rounded-full bg-trustBlue/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </div>

          <p className="mt-3 text-center text-xs text-ink/50">
            Attach files • Speak • Paste images • Get answers
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
