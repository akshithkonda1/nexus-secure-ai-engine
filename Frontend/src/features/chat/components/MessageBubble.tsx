import type { Message } from "../../chat/types";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function MessageBubble({ message }: { message: Message }) {
  const mine = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // TODO: surface clipboard failures to the user
    }
  };

  return (
    <div className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`} aria-live="polite">
      <div className={[
          "relative max-w-[78ch] whitespace-pre-wrap leading-relaxed text-[15px]",
          "px-4 py-2.5 rounded-2xl shadow-lg border",
          mine ? "bg-[rgba(var(--brand),1)] text-[rgb(var(--on-accent))] border-[rgba(var(--brand),0.7)] rounded-tr-none"
               : "bg-panel panel panel--glassy panel--hover text-ink border-app rounded-tl-none"
        ].join(" ")}>
        {message.text}
        <div
          className={`mt-1.5 text-[10px] tracking-wide ${mine ? "text-[rgba(var(--on-accent),0.7)]" : "text-ink/50"}`}
          aria-hidden="true"
        >
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </div>
        <button
          onClick={copy}
          className={`absolute -bottom-3 ${mine ? "right-2" : "left-2"} grid h-7 w-7 place-items-center rounded-full border border-[rgba(var(--border),0.45)] bg-[rgba(var(--surface),0.45)] backdrop-blur opacity-0 transition hover:opacity-100`}
          aria-label="Copy message"
          title="Copy"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
