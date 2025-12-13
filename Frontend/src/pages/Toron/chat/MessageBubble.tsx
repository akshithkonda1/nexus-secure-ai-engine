import { useMemo, useState } from "react";

import { safeFormatDistance } from "@/shared/lib/toronSafe";
import type { ToronMessage } from "@/state/toron/toronSessionTypes";

interface MessageBubbleProps {
  message: ToronMessage;
  onEdit: (message: ToronMessage) => void;
  onSaveToProject?: (content: string) => void;
}

export function MessageBubble({ message, onEdit, onSaveToProject }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const timestamp = useMemo(() => safeFormatDistance(message.timestamp), [message.timestamp]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <article
      tabIndex={0}
      className={`group relative w-full rounded-3xl border border-white/5 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl ${
        isUser
          ? "ml-auto max-w-3xl bg-[color-mix(in_srgb,var(--accent-primary)_14%,var(--panel-elevated))]"
          : "mr-auto max-w-4xl bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)]"
      }`}
    >
      <header className="mb-2 flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--text-primary)]">{isUser ? "You" : "Toron"}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--border-strong)]" />
          <span>{timestamp}</span>
          {message.meta?.browsing && (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_25%,transparent)] px-2 py-0.5 text-[0.7rem] font-semibold text-[var(--accent-primary)]">
              Browsing
            </span>
          )}
          {message.meta?.agentMode && (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-secondary)_25%,transparent)] px-2 py-0.5 text-[0.7rem] font-semibold text-[var(--accent-secondary)]">
              Agent Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
          {isUser && (
            <button
              type="button"
              onClick={() => onEdit(message)}
              className="rounded-full px-2 py-1 text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full px-2 py-1 text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          {!isUser && onSaveToProject && (
            <button
              type="button"
              onClick={() => onSaveToProject(message.content)}
              className="rounded-full px-2 py-1 text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
            >
              Save
            </button>
          )}
        </div>
      </header>
      <div className="prose prose-invert max-w-none text-sm leading-relaxed text-[var(--text-primary)]">
        {message.content}
      </div>
      {message.attachments?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.attachments.map((attachment) => (
            <span
              key={attachment.id}
              className="rounded-full bg-white/5 px-3 py-1 text-[0.75rem] text-[var(--text-primary)]"
            >
              {attachment.name} · {attachment.type}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default MessageBubble;
