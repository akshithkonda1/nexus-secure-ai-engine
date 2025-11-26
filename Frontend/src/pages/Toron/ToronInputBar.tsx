import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useToronSessionStore } from "@/state/toron/toronSessionStore";
import type { ToronMessage } from "@/state/toron/toronSessionTypes";

interface ToronInputBarProps {
  sessionId: string | null;
}

const API_CHAT = "/api/v1/toron/chat";

export function ToronInputBar({ sessionId }: ToronInputBarProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const appendMessages = useToronSessionStore((s) => s.appendMessages);

  const handleSend = async () => {
    if (!text.trim() || !sessionId || sending) return;

    const userText = text.trim();
    setText("");
    setSending(true);

    const userMessage: ToronMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: userText,
      timestamp: new Date().toISOString(),
    };

    appendMessages(sessionId, [userMessage]);

    try {
      const res = await fetch(API_CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: userText,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to reach Toron");
      }

      const data = await res.json();
      const assistantMessages = (data.messages ?? []).filter(
        (m: any) => m.sender === "toron"
      ) as ToronMessage[];

      if (assistantMessages.length > 0) {
        appendMessages(sessionId, assistantMessages);
      }
    } catch (err) {
      // optionally push an error bubble from Toron
      const errorMessage: ToronMessage = {
        id: crypto.randomUUID(),
        sender: "toron",
        text: "I ran into an issue processing your message. Please try again.",
        timestamp: new Date().toISOString(),
      };
      appendMessages(sessionId, [errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 z-20 px-4 pb-4 pt-2">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_94%,transparent)] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              sessionId
                ? "Ask Toron anything. Press Enter to send, Shift+Enter for new line."
                : "Creating session..."
            }
            disabled={!sessionId || sending}
            className="max-h-40 min-h-[52px] w-full resize-none bg-transparent text-sm text-[var(--text-primary)] outline-none"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[0.7rem] text-[var(--text-tertiary)]">
              Toron will use this session’s context to keep track of your work.
            </p>
            <button
              onClick={handleSend}
              disabled={!sessionId || sending || !text.trim()}
              className="flex items-center gap-1 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent-primary)_30%,transparent)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-[0_12px_40px_rgba(56,189,248,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Thinking…" : "Send"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
