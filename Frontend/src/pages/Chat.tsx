// src/pages/Chat.tsx
import * as React from "react";
import { motion } from "framer-motion";
import {
  Mic, Paperclip, Sparkles, Loader2, Send, Image as ImageIcon,
  X, Copy, Check, Volume2, Share2, Zap
} from "lucide-react";

type Role = "user" | "assistant" | "system";
type Msg = { id: string; role: Role; text: string; ts: number };
type Attach = {
  id: string; file: File; name: string; type: string; size: number;
  previewUrl?: string;
};

const uid = () => Math.random().toString(36).slice(2);
const isImage = (t: string) => /^image\//.test(t);
const DEMO_REPLY = (q: string) =>
  `**Verified Answer**\n\n> ${q}\n\n3+ sources agree: This is factual. No bias detected.\n\n**Share this truth.**`;

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div className={[
        "group relative max-w-[75ch] rounded-3xl px-5 py-4 shadow-xl transition-all",
        mine
          ? "bg-gradient-to-br from-trustBlue to-blue-700 text-white"
          : "bg-gradient-to-br from-app-surface to-app/90 text-ink border border-white/10 backdrop-blur-sm",
      ].join(" ")}>
        <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
          {m.text}
        </div>

        {/* Copy Button */}
        <button
          onClick={copy}
          className={`absolute -top-3 ${mine ? "-left-3" : "-right-3"} 
            grid h-8 w-8 place-items-center rounded-full border border-white/20 
            bg-panel/90 backdrop-blur-sm text-xs text-muted 
            opacity-0 transition-all group-hover:opacity-100 hover:scale-110`}
          aria-label="Copy"
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </button>

        {/* Share Button (Assistant Only) */}
        {!mine && (
          <button
            className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4 text-trustBlue" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function AttachmentChip({ a, onRemove }: { a: Attach; onRemove: (id: string) => void }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 rounded-full border border-app/50 bg-app/30 px-3 py-1.5 text-xs font-medium text-ink backdrop-blur"
    >
      {isImage(a.type) ? (
        <div className="h-6 w-6 overflow-hidden rounded-full ring-2 ring-trustBlue/50">
          <img src={a.previewUrl} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <Paperclip className="h-4 w-4 text-trustBlue" />
      )}
      <span className="max-w-[18ch] truncate">{a.name}</span>
      <button
        onClick={() => onRemove(a.id)}
        className="rounded-full p-1 hover:bg-white/20 transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

function useAutogrow(ref: React.RefObject<HTMLTextAreaElement>, deps: any[]) {
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    const h = Math.min(160, el.scrollHeight);
    el.style.height = h + "px";
  }, deps);
}

export function ChatPage() {
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: uid(),
      role: "system",
      ts: Date.now(),
      text: "Nexus is online. Ask anything — I verify from 3+ sources. Attach files or tell me what you need.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [voicePartial, setVoicePartial] = React.useState<string | null>(null);
  const [attachments, setAttachments] = React.useState<Attach[]>([]);
  const taRef = React.useRef<HTMLTextAreaElement>(null);
  useAutogrow(taRef, [input]);

  const send = async () => {
    const text = input.trim();
    if (!text && !attachments.length) return;

    setBusy(true);
    const userMsg: Msg = { id: uid(), role: "user", text: text || "(Attachment)", ts: Date.now() };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setAttachments(prev => {
      prev.forEach(a => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
      return [];
    });

    await new Promise(r => setTimeout(r, 800));
    const reply: Msg = {
      id: uid(),
      role: "assistant",
      ts: Date.now(),
      text: DEMO_REPLY(userMsg.text),
    };
    setMessages(m => [...m, reply]);
    setBusy(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-app-bg text-app-text font-sans">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-app/30 bg-app/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-trustBlue animate-pulse" />
              <Zap className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-trustBlue to-blue-400 bg-clip-text text-transparent">
              Nexus.ai
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Verifying sources…</span>
              </>
            ) : voicePartial !== null ? (
              <>
                <Volume2 className="h-3.5 w-3.5 animate-pulse text-trustBlue" />
                <span>Listening…</span>
              </>
            ) : (
              <span className="text-green-400">● Ready</span>
            )}
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-5xl space-y-5">
          {messages.map(m => (
            <MessageBubble key={m.id} m={m} />
          ))}
          {busy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-3 rounded-3xl bg-app-surface/80 px-5 py-4 text-sm text-muted backdrop-blur">
                <Loader2 className="h-4 w-4 animate-spin text-trustBlue" />
                <span>Cross-referencing 3+ sources…</span>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Composer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky bottom-0 z-50 border-t border-app/30 bg-app/70 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-5xl px-5 py-4">
          {/* Attachments */}
          {attachments.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mb-3 flex flex-wrap gap-2"
            >
              {attachments.map(a => (
                <AttachmentChip key={a.id} a={a} onRemove={id => {
                  setAttachments(prev => prev.filter(x => x.id !== id));
                }} />
              ))}
            </motion.div>
          )}

          {/* Voice Partial */}
          {voicePartial !== null && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="mb-3 rounded-2xl border border-trustBlue/30 bg-app/50 px-4 py-2.5 text-sm text-ink backdrop-blur"
            >
              <Mic className="inline h-4 w-4 mr-2 text-trustBlue animate-pulse" />
              {voicePartial || "…"}
            </motion.div>
          )}

          {/* Input */}
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                ref={taRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask anything. Press Enter to send."
                className="w-full resize-none rounded-2xl border border-app/40 bg-app/60 px-5 py-3.5 pr-12 text-sm text-ink placeholder:text-muted/70 outline-none backdrop-blur transition-all focus:border-trustBlue/70 focus:ring-2 focus:ring-trustBlue/30"
                rows={1}
              />
              <div className="absolute bottom-2 right-3 text-[10px] uppercase tracking-wider text-muted/60">
                Enter
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={send}
              disabled={busy || (!input.trim() && !attachments.length)}
              className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-trustBlue to-blue-600 p-3 text-white shadow-lg transition-all disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              )}
              <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            </motion.button>
          </div>

          <p className="mt-2 text-center text-xs text-muted/70">
            Attach files • Speak • Get truth. Share instantly.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default ChatPage;
