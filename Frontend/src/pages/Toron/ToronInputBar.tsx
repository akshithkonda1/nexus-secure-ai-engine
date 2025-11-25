import { useMemo, useState } from "react";

import { useToronStore } from "@/state/toron/toronStore";

export default function ToronInputBar() {
  const { addMessage, simulateToronReply, loading } = useToronStore();
  const [value, setValue] = useState("");

  const glassVars = useMemo(
    () => ({
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }),
    [],
  );

  const handleSend = () => {
    const text = value.trim();
    if (!text || loading) return;

    addMessage({
      sender: "user",
      text,
    });

    simulateToronReply(text);
    setValue("");
  };

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
          {loading && (
            <div className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
              <span className="animate-pulse">Toron is thinking…</span>
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!value.trim() || loading}
          className="group relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(59,130,246,0.4)] transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_18px_46px_rgba(99,102,241,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="relative">Send</span>
          <span
            className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
            style={{ background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2), transparent 50%)" }}
          />
        </button>
      </div>
    </div>
  );
}
