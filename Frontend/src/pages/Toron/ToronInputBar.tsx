import { useEffect, useMemo, useState } from "react";

import { useToronStore } from "@/state/toron/toronStore";

export function ToronInputBar() {
  const {
    addMessage,
    updateMessage,
    streaming,
    setStreaming,
    setLoading,
    initialWelcomeShown,
    setInitialWelcomeShown,
  } = useToronStore();
  const [value, setValue] = useState("");

  const glassVars = useMemo(
    () => ({
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }),
    [],
  );

  const handleSend = async () => {
    const text = value.trim();
    if (!text || streaming) return;

    setValue("");
    setLoading(true);

    if (!initialWelcomeShown) {
      setInitialWelcomeShown();
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      text,
      timestamp: Date.now(),
    };

    addMessage(userMessage);

    try {
      await fetch("/api/v1/ask", { method: "POST", body: text });
    } catch (error) {
      console.warn("Stubbed Toron API failed (expected in dev)", error);
    }

    setStreaming(true);
    const toronId = `toron-${Date.now()}`;
    const simulated =
      "I’m processing your request with multi-model context. Here is a simulated Toron response streaming in real time to showcase the new interface.";

    addMessage({
      id: toronId,
      sender: "toron",
      text: "",
      timestamp: Date.now(),
    });

    let idx = 0;
    const stream = () => {
      if (idx >= simulated.length) {
        setStreaming(false);
        setLoading(false);
        return;
      }

      updateMessage(toronId, (prev) => ({
        ...prev,
        text: prev.text + simulated[idx],
      }));
      idx += 1;
      setTimeout(stream, 12);
    };

    stream();
  };

  useEffect(() => {
    if (!streaming) {
      setLoading(false);
    }
  }, [streaming, setLoading]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-6">
      <div
        className="pointer-events-auto flex w-full max-w-5xl items-center gap-3 rounded-full border border-white/30 bg-white/60 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-white/5"
        style={glassVars}
      >
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            placeholder="Ask Toron anything..."
            className="h-12 w-full resize-none bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
          />
          {streaming && (
            <div className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
              <span className="animate-pulse">Toron is thinking…</span>
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!value.trim() || streaming}
          className="group relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.4)] transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_18px_46px_rgba(99,102,241,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="relative">Send</span>
          <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100" style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2), transparent 50%)" }} />
        </button>
      </div>
    </div>
  );
}

export default ToronInputBar;
