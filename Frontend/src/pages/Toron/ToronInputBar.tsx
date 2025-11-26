import { useCallback, useMemo, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { nanoid } from "nanoid";

import { DEFAULT_PROJECT, useToronStore } from "@/state/toron/toronStore";

export default function ToronInputBar() {
  const {
    addMessage,
    appendToMessage,
    setStreaming,
    setLoading,
    streaming,
    loading,
    activeProjectId,
  } = useToronStore();
  const [value, setValue] = useState("");

  const glassStyles = useMemo(
    () => ({
      backdropFilter: "blur(18px) saturate(150%)",
      WebkitBackdropFilter: "blur(18px) saturate(150%)",
    }),
    [],
  );

  const disabled = !value.trim() || streaming || loading;

  const simulateStream = useCallback(
    async (output: string, projectId: string, messageId: string) => {
      for (const char of output) {
        appendToMessage(projectId, messageId, char);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 12));
      }
    },
    [appendToMessage],
  );

  const handleSend = useCallback(async () => {
    const prompt = value.trim();
    if (!prompt || streaming) return;

    const userMessageId = nanoid();
    const toronMessageId = nanoid();
    const projectId = activeProjectId ?? DEFAULT_PROJECT.id;

    addMessage({
      id: userMessageId,
      sender: "user",
      text: prompt,
      timestamp: Date.now(),
    });

    addMessage({
      id: toronMessageId,
      sender: "toron",
      text: "",
      timestamp: Date.now(),
    });

    setValue("");
    setLoading(true);
    setStreaming(true);

    try {
      const res = await fetch("/api/v1/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json().catch(() => null);
      const outputString = data?.answer ?? `Toron received: "${prompt}"`;

      await simulateStream(outputString, projectId, toronMessageId);
    } catch (error) {
      await simulateStream(
        "Toron is warming up. Let's try that again in a moment.",
        projectId,
        toronMessageId,
      );
    } finally {
      setStreaming(false);
      setLoading(false);
    }
  }, [
    activeProjectId,
    addMessage,
    setLoading,
    setStreaming,
    simulateStream,
    streaming,
    value,
  ]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-6">
      <div
        className="pointer-events-auto flex w-full max-w-5xl items-end gap-3 rounded-[20px] border border-white/30 bg-white/60 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-150 ease-out hover:-translate-y-[1px] hover:shadow-[0_22px_70px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-white/10"
        style={glassStyles}
      >
        <div className="flex-1">
          <TextareaAutosize
            value={value}
            minRows={1}
            maxRows={6}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Toron anything..."
            className="w-full resize-none bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
          />
          {(streaming || loading) && (
            <div className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
              <span className="animate-pulse">Toron is thinking…</span>
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
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
