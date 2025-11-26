import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { safeRender } from "@/shared/lib/safeRender";
import { safeMessage, safeString } from "@/shared/lib/toronSafe";
import { useToronSessionStore } from "@/state/toron/toronSessionStore";
import type { ToronMessage } from "@/state/toron/toronSessionTypes";

interface ToronInputBarProps {
  sessionId: string | null;
}

const API_CHAT = "/api/v1/toron/chat";

export function ToronInputBar({ sessionId }: ToronInputBarProps) {
  const telemetry = useToronTelemetry();
  const { addMessage } = useToronSessionStore();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!sessionId) setText("");
  }, [sessionId]);

  const resetField = useCallback(() => setText("") , []);

  const handleSend = useCallback(async () => {
    if (!sessionId || sending) return;
    const trimmed = safeString(text, "").trim();
    if (!trimmed) return;
    setSending(true);
    const userMessage: ToronMessage = safeMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      model: "user",
      timestamp: new Date().toISOString(),
    });
    addMessage(sessionId, userMessage);
    resetField();

    try {
      const res = await fetch(API_CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: trimmed }),
      });
      if (!res.ok) throw new Error("Toron chat unavailable");
      const data = await res.json().catch(() => ({ messages: [] }));
      const assistantMessages = Array.isArray(data.messages)
        ? data.messages.map((m: unknown) => safeMessage({ ...m, role: "assistant" }))
        : [];
      assistantMessages.forEach((m) => addMessage(sessionId, m));
    } catch (error) {
      telemetry("network_error", { action: "send_message", error: (error as Error).message });
      const errorMessage: ToronMessage = safeMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I ran into an issue processing your message. Please try again.",
        model: "system",
        timestamp: new Date().toISOString(),
      });
      addMessage(sessionId, errorMessage);
    } finally {
      setSending(false);
    }
  }, [sessionId, sending, text, addMessage, telemetry, resetField]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      try {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          void handleSend();
        }
      } catch (error) {
        telemetry("interaction", { action: "keydown", error: (error as Error).message });
      }
    },
    [handleSend, telemetry],
  );

  const placeholder = useMemo(
    () => (sessionId ? "Ask Toron anything. Press Enter to send." : "Session initializing..."),
    [sessionId],
  );

  return safeRender(
    () => (
      <div className="sticky bottom-0 z-20 px-4 pb-4 pt-2" data-testid="toron-input-bar">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_94%,transparent)] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={!sessionId || sending}
            className="max-h-40 min-h-[52px] w-full resize-none bg-transparent text-sm text-[var(--text-primary)] outline-none"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[0.7rem] text-[var(--text-tertiary)]">Toron will use this session’s context to keep track of your work.</p>
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!sessionId || sending || !text.trim()}
              className="flex items-center gap-1 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent-primary)_30%,transparent)] px-4 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-[0_12px_40px_rgba(56,189,248,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Thinking…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    ),
    <div className="sticky bottom-0 border-t border-[var(--border-soft)] bg-[var(--panel-main)] px-4 py-3 text-sm text-[var(--text-secondary)]">
      Input unavailable.
    </div>,
  );
}
