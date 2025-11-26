import { useMemo, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { nanoid } from "nanoid";

import { useToronStore } from "@/state/toron/toronStore";

export default function ToronInputBar() {
  const { activeSessionId, addMessage, autoGenerateTitleFromFirstToronReply } =
    useToronStore();
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);

  const glassStyles = useMemo(
    () => ({
      backdropFilter: "blur(18px) saturate(150%)",
      WebkitBackdropFilter: "blur(18px) saturate(150%)",
    }),
    [],
  );

  const disabled = !inputValue.trim() || sending || !activeSessionId;

  async function sendMessage() {
    if (!inputValue.trim() || !activeSessionId) return;

    // 1. Add user message locally
    addMessage(activeSessionId, {
      id: nanoid(),
      sender: "user",
      text: inputValue,
      timestamp: Date.now(),
    });

    const msg = inputValue;
    setInputValue("");
    setSending(true);

    try {
      // 2. Send to backend
      const res = await fetch("/api/v1/toron/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: msg,
        }),
      });

      const data = await res.json();

      // 3. Insert Toron reply
      addMessage(activeSessionId, {
        id: nanoid(),
        sender: "toron",
        text: data.reply,
        timestamp: Date.now(),
      });

      // 4. Title auto-generation
      autoGenerateTitleFromFirstToronReply(activeSessionId);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-6">
      <div
        className="pointer-events-auto flex w-full max-w-5xl items-end gap-3 rounded-[20px] border border-white/30 bg-white/60 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-150 ease-out hover:-translate-y-[1px] hover:shadow-[0_22px_70px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-white/10"
        style={glassStyles}
      >
        <div className="flex-1">
          <TextareaAutosize
            value={inputValue}
            minRows={1}
            maxRows={6}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask Toron anything..."
            className="w-full resize-none bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
          />
          {sending && (
            <div className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
              <span className="animate-pulse">Toron is thinking…</span>
            </div>
          )}
        </div>
        <button
          onClick={() => void sendMessage()}
          disabled={disabled}
          className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[var(--toron-cosmic-primary)] to-[var(--toron-cosmic-secondary)] px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(0,225,255,0.35)] transition-all duration-150 ease-out enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_18px_46px_rgba(154,77,255,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="relative">Send</span>
          <span
            className="absolute inset-0 opacity-0 transition enabled:group-hover:opacity-100"
            style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.22), transparent 55%)" }}
          />
        </button>
      </div>
    </div>
  );
}
