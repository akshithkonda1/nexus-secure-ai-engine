import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Paperclip, Loader2, ChevronDown } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { useChatSession } from "../features/chat/hooks/useChatSession";
import { MessageBubble } from "../features/chat/components/MessageBubble";
import { TypingIndicator } from "../features/chat/components/TypingIndicator";
import { AttachmentChip } from "../features/chat/components/AttachmentChip";
import type { Attachment as Attach } from "../features/chat/types";

const MAX_INPUT_LENGTH = 4000;
const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ChatPage() {
  const { id } = useParams<{ id?: string }>();
  const sessionId = id?.trim() ? id : "new";
  const { messages, isConnected, isTyping, error, sendMessage, reconnect } = useChatSession(sessionId);

  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attach[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 72,
    overscan: 8,
    getItemKey: (i) => messages[i]?.id ?? String(i),
    measureElement: (el) =>
      (el as HTMLElement).getBoundingClientRect
        ? (el as HTMLElement).getBoundingClientRect().height
        : 72
  });

  useEffect(() => {
    const el = textareaRef.current; if (!el) return;
    el.style.height = "0px"; el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  useEffect(() => {
    if (isAtBottom && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  useEffect(() => {
    const c = scrollContainerRef.current; if (!c) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = c;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 120);
    };
    c.addEventListener("scroll", onScroll, { passive: true });
    return () => c.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => { attachments.forEach(a => a.previewUrl && URL.revokeObjectURL(a.previewUrl)); }, [attachments]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const available = MAX_ATTACHMENTS - attachments.length;
    const slice = Array.from(files).slice(0, Math.max(0, available));
    const next: Attach[] = [];
    for (const f of slice) {
      if (f.size > MAX_FILE_SIZE) continue;
      next.push({ id: crypto.randomUUID(), file: f, name: f.name, type: f.type, size: f.size, previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined });
    }
    if (next.length) setAttachments(p => [...p, ...next]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const rm = prev.find(a => a.id === id);
      if (rm?.previewUrl) URL.revokeObjectURL(rm.previewUrl);
      return prev.filter(a => a.id !== id);
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    if (!isConnected) return;
    try {
      await sendMessage({ text, attachments: attachments.map(a => a.file) });
      setInput("");
      setAttachments(prev => { prev.forEach(a => a.previewUrl && URL.revokeObjectURL(a.previewUrl)); return []; });
      textareaRef.current?.focus();
    } catch (e) { console.error(e); }
  };

  const canSend = isConnected && (input.trim().length > 0 || attachments.length > 0);

  return (
    <div className="flex h-screen flex-col bg-app text-ink">
      {error && (
        <div className="flex items-center justify-between gap-3 border-b border-red-800/20 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-300">
          <span>{error}</span>
          <button onClick={reconnect} className="btn btn-ghost rounded-md border border-red-500/30 px-2 py-1">Reconnect</button>
        </div>
      )}

      {!isConnected && !error && (
        <div className="flex items-center justify-center gap-2 border-b border-app bg-yellow-500/10 px-4 py-2 text-sm text-yellow-700 dark:text-yellow-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting to Nexus…
        </div>
      )}

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-3xl">
          <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
            {virtualizer.getVirtualItems().map((item) => {
              const m = messages[item.index];
              return (
                <div
                  key={m.id}
                  ref={(el) => el && virtualizer.measureElement(el)}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${item.start}px)` }}
                >
                  <MessageBubble message={m} />
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex justify-start">
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!isAtBottom && (
        <button
          onClick={() => scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "smooth" })}
          className="fixed bottom-28 left-1/2 -translate-x-1/2 rounded-full border border-app bg-panel panel panel--glassy panel--hover px-4 py-2 text-sm shadow-lg transition hover:shadow-xl"
        >
          <span className="inline-flex items-center gap-1"><ChevronDown className="h-4 w-4" /> New messages</span>
        </button>
      )}

      <div className="border-t border-app bg-panel/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-2 flex flex-wrap gap-2 overflow-hidden">
                {attachments.map((a) => <AttachmentChip key={a.id} attachment={a} onRemove={removeAttachment} />)}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={(e) => handleFileSelect(e.target.files)} />

            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={attachments.length >= MAX_ATTACHMENTS} className="btn btn-ghost grid h-10 w-10 place-items-center rounded-full bg-app text-muted transition hover:bg-app/80 hover:text-ink disabled:opacity-50" aria-label="Attach files">
              <Paperclip className="h-5 w-5" />
            </button>

            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
                onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleSend(); } }}
                placeholder="Message Nexus…"
                rows={1}
                aria-label="Message input"
                className="w-full resize-none rounded-2xl border border-app bg-app px-4 py-3 pr-16 text-sm text-ink outline-none placeholder:text-muted focus:border-trustBlue/50 focus:ring-2 focus:ring-trustBlue/20"
              />
              <div className="pointer-events-none absolute bottom-2 right-3 text-xs text-muted">
                {input.length > MAX_INPUT_LENGTH * 0.9 && `${input.length}/${MAX_INPUT_LENGTH}`}
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              whileHover={canSend ? { scale: 1.05 } : {}}
              whileTap={canSend ? { scale: 0.95 } : {}}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zora-aurora text-zora-night font-semibold shadow-zora-glow transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-zora-glow hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>

          <p className="mt-2 text-center text-xs text-muted">
            <kbd className="rounded bg-app px-1.5 py-0.5 font-mono text-xs">⌘</kbd> + <kbd className="rounded bg-app px-1.5 py-0.5 font-mono text-xs">Enter</kbd> to send
          </p>
        </div>
      </div>
    </div>
  );
}
