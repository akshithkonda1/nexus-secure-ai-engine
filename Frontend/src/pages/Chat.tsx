import * as React from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

/** —————————————————————————————————
 *  Types
 *  ————————————————————————————————— */
type Role = "user" | "assistant" | "system";
type Msg = { id: string; role: Role; text: string; ts: number };

type Attach = {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  previewUrl?: string; // for images
};

/** —————————————————————————————————
 *  Helpers
 *  ————————————————————————————————— */
const uid = () => Math.random().toString(36).slice(2);
const isImage = (t: string) => /^image\//.test(t);

const DEMO_REPLY = (q: string) =>
  `Working on it…\n\nYou asked:\n> ${q}\n\nThis is where your debate/consensus response will render.`;

/** —————————————————————————————————
 *  Message bubble
 *  ————————————————————————————————— */
function MessageBubble({ m }: { m: Msg }) {
  const mine = m.role === "user";
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(m.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 800);
    } catch {}
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${mine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={[
          "group relative max-w-[75ch] whitespace-pre-wrap leading-relaxed",
          "rounded-2xl px-4 py-3 shadow",
          mine
            ? "bg-trustBlue/90 text-white"
            : "bg-app/90 text-ink border border-white/10",
        ].join(" ")}
      >
        {m.text}
        <button
          onClick={copy}
          className={`absolute -top-2 ${mine ? "-left-2" : "-right-2"} grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-panel text-muted opacity-0 transition group-hover:opacity-100`}
          aria-label="Copy message"
          title="Copy"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </motion.div>
  );
}

/** —————————————————————————————————
 *  Attachment chip
 *  ————————————————————————————————— */
function AttachmentChip({
  a,
  onRemove,
}: {
  a: Attach;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-app bg-panel/80 px-2 py-1 text-xs text-muted">
      {isImage(a.type) ? (
        <span className="inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10">
          {a.previewUrl ? (
            <img
              src={a.previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-3.5 w-3.5" />
          )}
        </span>
      ) : (
        <Paperclip className="h-3.5 w-3.5" />
      )}
      <span className="max-w-[22ch] truncate">{a.name}</span>
      <button
        type="button"
        onClick={() => onRemove(a.id)}
        className="rounded-full p-1 text-muted hover:bg-white/10 hover:text-ink"
        aria-label={`Remove ${a.name}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** —————————————————————————————————
 *  Auto-resize textarea hook
 *  ————————————————————————————————— */
function useAutogrow(ref: React.RefObject<HTMLTextAreaElement>, deps: any[]) {
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    const h = Math.min(192, el.scrollHeight); // cap
    el.style.height = h + "px";
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/** —————————————————————————————————
 *  Page component
 *  ————————————————————————————————— */
export function ChatPage() {
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: uid(),
      role: "system",
      ts: Date.now(),
      text:
        "Welcome to Nexus. Evidence, synthesis, and bias checks are a tap away. Attach files or speak to start.",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [voicePartial, setVoicePartial] = React.useState<string | null>(null);
  const [attachments, setAttachments] = React.useState<Attach[]>([]);

  const taRef = React.useRef<HTMLTextAreaElement>(null);
  useAutogrow(taRef, [input]);

  /** ——— Custom event wiring ——— */

  // Quick prompt inserts
  React.useEffect(() => {
    const onInsert = (e: Event) => {
      const text = (e as CustomEvent<string>).detail ?? "";
      setInput((v) => (v ? v + (v.endsWith(" ") ? "" : " ") + text : text));
      taRef.current?.focus();
    };
    window.addEventListener("nexus:prompt:insert", onInsert as EventListener);
    return () =>
      window.removeEventListener("nexus:prompt:insert", onInsert as EventListener);
  }, []);

  // File attachments from UserBar
  React.useEffect(() => {
    const onAttach = (e: Event) => {
      const files = (e as CustomEvent<FileList | File[] | null>).detail;
      if (!files) return;
      const arr = Array.from(files as any as File[]);
      setAttachments((prev) => [
        ...prev,
        ...arr.map((f) => ({
          id: uid(),
          file: f,
          name: f.name,
          type: f.type,
          size: f.size,
          previewUrl: isImage(f.type) ? URL.createObjectURL(f) : undefined,
        })),
      ]);
      const names = arr.map((f) => f.name).join(", ");
      setInput((v) => (v ? `${v} ` : "") + `Attached: ${names}`);
    };
    window.addEventListener("nexus:attach", onAttach as EventListener);
    return () =>
      window.removeEventListener("nexus:attach", onAttach as EventListener);
  }, []);

  // Voice events from UserBar
  React.useEffect(() => {
    const recStart = () => setVoicePartial("");
    const recPartial = (e: Event) =>
      setVoicePartial((e as CustomEvent<string>).detail ?? "");
    const recData = (e: Event) => {
      setVoicePartial(null);
      const { blob, transcript } = (e as CustomEvent<{
        blob: Blob;
        transcript?: string;
      }>).detail;

      if (transcript && transcript.trim()) {
        setInput((v) => (v ? `${v} ${transcript.trim()}` : transcript.trim()));
      } else if (blob) {
        const f = new File([blob], "voice.webm", { type: "audio/webm" });
        setAttachments((prev) => [
          ...prev,
          { id: uid(), file: f, name: f.name, type: f.type, size: f.size },
        ]);
      }
    };
    const recErr = () => setVoicePartial(null);

    window.addEventListener(
      "nexus:voice:recording",
      recStart as unknown as EventListener
    );
    window.addEventListener(
      "nexus:voice:partial",
      recPartial as unknown as EventListener
    );
    window.addEventListener(
      "nexus:voice:data",
      recData as unknown as EventListener
    );
    window.addEventListener(
      "nexus:voice:error",
      recErr as unknown as EventListener
    );
    return () => {
      window.removeEventListener(
        "nexus:voice:recording",
        recStart as unknown as EventListener
      );
      window.removeEventListener(
        "nexus:voice:partial",
        recPartial as unknown as EventListener
      );
      window.removeEventListener(
        "nexus:voice:data",
        recData as unknown as EventListener
      );
      window.removeEventListener(
        "nexus:voice:error",
        recErr as unknown as EventListener
      );
    };
  }, []);

  /** ——— Actions ——— */
  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      prev
        .filter((a) => a.previewUrl)
        .forEach((a) => {
          if (a.id === id && a.previewUrl) URL.revokeObjectURL(a.previewUrl);
        });
      return prev.filter((a) => a.id !== id);
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;

    setBusy(true);
    const userMsg: Msg = { id: uid(), role: "user", text: text || "(No text)", ts: Date.now() };
    setMessages((m) => [...m, userMsg]);

    // clear UI immediately
    setInput("");
    setAttachments((prev) => {
      prev.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
      return [];
    });

    // Demo assistant reply
    await new Promise((r) => setTimeout(r, 400));
    const reply: Msg = {
      id: uid(),
      role: "assistant",
      ts: Date.now(),
      text: DEMO_REPLY(userMsg.text),
    };
    setMessages((m) => [...m, reply]);
    setBusy(false);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void send();
    }
  };

  /** ——— UI ——— */
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-app bg-panel/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-screen-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-trustBlue" />
            <h1 className="text-sm font-semibold text-ink">Chat</h1>
          </div>
          <p className="text-xs text-muted">
            {busy ? "Generating…" : voicePartial !== null ? "Listening…" : "Ready"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="mx-auto flex w-full max-w-screen-lg flex-1 flex-col gap-3 px-4 py-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} m={m} />
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-panel/80 px-4 py-3 text-sm text-muted">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Thinking…
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 z-10 border-t border-app bg-panel/80 backdrop-blur">
        <div className="mx-auto w-full max-w-screen-lg px-4 py-3">
          {/* Attachment chips */}
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((a) => (
                <AttachmentChip key={a.id} a={a} onRemove={removeAttachment} />
              ))}
            </div>
          )}

          {/* Voice partial */}
          {voicePartial !== null && (
            <div className="mb-2 rounded-lg border border-white/10 bg-app/70 px-3 py-2 text-xs text-muted">
              <Mic className="mr-2 inline h-3.5 w-3.5" />
              {voicePartial || "…"}
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={taRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask anything. Use Ctrl/⌘+Enter to send."
                className="w-full resize-none rounded-xl border border-app bg-app/80 px-4 py-3 text-sm text-ink outline-none placeholder:text-muted"
                rows={1}
              />
              {/* Quick actions hint */}
              <div className="pointer-events-none absolute -bottom-5 right-2 text-[10px] uppercase tracking-wide text-muted">
                Ctrl/⌘ + Enter to send
              </div>
            </div>

            <button
              onClick={send}
              disabled={busy || (!input.trim() && attachments.length === 0)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-trustBlue px-4 text-sm font-semibold text-white shadow transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </div>

          {/* Footer helpers */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>Attach files via the paperclip in the footer bar, or use Voice.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Provide a default export for router setups that expect it */
export default ChatPage;
