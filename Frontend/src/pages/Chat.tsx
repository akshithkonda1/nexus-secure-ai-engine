import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Paperclip, Mic, Send, Sparkles, Loader2, ChevronDown } from "lucide-react";
import BetaBanner from "@/components/BetaBanner";

/** ─────────────────────────────────────────────
 * Minimal in-memory chat model (stub your engine)
 * ───────────────────────────────────────────── */
type Msg = { id: string; role: "user" | "assistant" | "system"; text: string };
const demoReply = (q: string) =>
  `Working on it… (fake reply)\n\nYou asked:\n> ${q}\n\nThis is where your debate/consensus response will render.`;

/** ─────────────────────────────────────────────
 * Message bubble
 * ───────────────────────────────────────────── */
function MessageBubble({ m }: { m: Msg }) {
  const mine = m.role === "user";
  const system = m.role === "system";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[75ch] whitespace-pre-wrap leading-relaxed",
          "rounded-2xl px-4 py-3 shadow-sm",
          system
            ? "bg-white/5 text-muted border border-white/10"
            : mine
            ? "bg-trustBlue/10 border border-trustBlue/20 text-ink"
            : "bg-panel border border-white/10 text-ink",
        ].join(" ")}
      >
        {m.text}
      </div>
    </div>
  );
}

/** ─────────────────────────────────────────────
 * Composer (sticky bottom)
 * ───────────────────────────────────────────── */
function Composer({
  value,
  setValue,
  onSend,
  busy,
  onAttach,
  onToggleVoice,
  recording,
  onOpenPromptBrowser,
}: {
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  onAttach: (files: FileList) => void;
  onToggleVoice: () => void;
  recording: boolean;
  onOpenPromptBrowser: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(220, Math.max(56, ta.scrollHeight)) + "px";
  }, [value]);

  return (
    <div className="sticky bottom-0 z-10 border-t border-app bg-app-surface/92 backdrop-blur supports-[backdrop-filter]:bg-app-surface/80">
      <div className="mx-auto w-full max-w-3xl px-4 py-3">
        <div className="rounded-2xl border border-app bg-panel shadow-inner">
          <div className="flex items-end gap-2 px-3 pt-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mb-2 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-app px-2 text-muted hover:text-ink"
              title="Attach"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Message Nexus…"
              className="min-h-[56px] max-h-[220px] w-full resize-none bg-transparent px-1 py-2 text-[15px] text-ink outline-none placeholder:text-muted"
            />
            <button
              type="button"
              onClick={onToggleVoice}
              className={`mb-2 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-app px-2 text-muted hover:text-ink ${
                recording ? "bg-white/5 text-ink" : ""
              }`}
              title="Voice"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onOpenPromptBrowser}
              className="mb-2 inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-app px-2 text-muted hover:text-ink"
              title="Prompt Browser"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-app px-3 py-2">
            <p className="text-xs text-muted">Shift + Enter for new line</p>
            <button
              type="button"
              onClick={onSend}
              disabled={!value.trim() || busy}
              className="inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-2 text-sm font-semibold text-white transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-lg disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length) onAttach(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}

/** ─────────────────────────────────────────────
 * Chat Page (ChatGPT-like)
 * ───────────────────────────────────────────── */
export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]); // banner replaces old system message
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);

  // scroll/viewport handling
  const listRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);

  // observe bottom sentinel to decide auto-scroll
  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setAtBottom(entries[0]?.isIntersecting ?? true),
      { root: listRef.current, threshold: 1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // auto-scroll only if at bottom
  useEffect(() => {
    if (atBottom) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs.length, busy, atBottom]);

  // Global event hooks
  useEffect(() => {
    const onPrompt = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail;
      if (typeof prompt === "string") setInput((prev) => (prev ? prev + "\n" : "") + prompt);
    };
    const onAttach = (e: Event) => {
      const files = (e as CustomEvent<FileList>).detail;
      if (files?.length) {
        const names = Array.from(files).map((f) => f.name).join(", ");
        setInput((v) => (v ? v + "\n" : "") + `Attached: ${names}`);
      }
    };
    const onVoicePartial = (e: Event) => {
      const partial = (e as CustomEvent<string>).detail;
      if (partial) setInput(partial);
    };
    window.addEventListener("nexus:prompt:insert", onPrompt as EventListener);
    window.addEventListener("nexus:attach", onAttach as EventListener);
    window.addEventListener("nexus:voice:partial", onVoicePartial as EventListener);
    return () => {
      window.removeEventListener("nexus:prompt:insert", onPrompt as EventListener);
      window.removeEventListener("nexus:attach", onAttach as EventListener);
      window.removeEventListener("nexus:voice:partial", onVoicePartial as EventListener);
    };
  }, []);

  // Send message (stub: replace with engine call/stream)
  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setBusy(true);
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "user", text: q }]);
    setInput("");
    window.dispatchEvent(new CustomEvent("nexus:chat:send", { detail: { text: q } }));

    await new Promise((r) => setTimeout(r, 400));
    setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: demoReply(q) }]);
    setBusy(false);
  };

  // Voice toggle (reuses your global pipeline)
  const toggleVoice = () => {
    setRecording((r) => !r);
    window.dispatchEvent(
      new CustomEvent("nexus:voice:recording", { detail: { state: recording ? "stop" : "start" } })
    );
  };

  const openPromptBrowser = () => window.dispatchEvent(new CustomEvent("nexus:prompts:open"));
  const onAttach = (files: FileList) => window.dispatchEvent(new CustomEvent("nexus:attach", { detail: files }));

  // Drag & drop + paste to attach
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) onAttach(e.dataTransfer.files);
  };
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault();
  const onPaste: React.ClipboardEventHandler<HTMLDivElement> = (e) => {
    const items = e.clipboardData?.files;
    if (items?.length) onAttach(items);
  };

  return (
    <div
      className="h-[calc(100dvh-56px)] w-full" /* adjust 56px if your header height differs */
      onDrop={onDrop}
      onDragOver={onDragOver}
      onPaste={onPaste}
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col">
        {/* Beta banner */}
        <div className="px-4 pt-4">
          <BetaBanner />
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
          <div className="space-y-4">
            {msgs.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-panel px-4 py-3 text-muted">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Nexus is thinking…
                </div>
              </div>
            )}
            {/* bottom sentinel */}
            <div ref={endRef} />
          </div>
        </div>

        {/* Jump to latest when scrolled up */}
        {!atBottom && (
          <button
            onClick={() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })}
            className="pointer fixed bottom-28 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-panel/90 px-3 py-1 text-xs text-muted shadow backdrop-blur hover:text-ink"
            title="Jump to latest"
          >
            <ChevronDown className="mr-1 inline h-3 w-3" />
            Jump to latest
          </button>
        )}

        {/* Composer */}
        <Composer
          value={input}
          setValue={setInput}
          onSend={send}
          busy={busy}
          onAttach={onAttach}
          onToggleVoice={toggleVoice}
          recording={recording}
          onOpenPromptBrowser={openPromptBrowser}
        />
      </div>
    </div>
  );
}
