"use client";

import clsx from "clsx";
import React from "react";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-react";

type ZoraMessageActionsProps = {
  messageId: string;
  messageText: string;
  onCopy(text: string): void;
  onFeedback(messageId: string, direction: "up" | "down"): void;
  activeDirection?: "up" | "down" | null;
  disabled?: boolean;
};

const iconButtonBase =
  "h-8 w-8 rounded-full border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800/70 dark:hover:text-slate-100";

export function ZoraMessageActions({
  messageId,
  messageText,
  onCopy,
  onFeedback,
  activeDirection,
  disabled,
}: ZoraMessageActionsProps) {
  return (
    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
      <button
        type="button"
        title="Thumbs up"
        onClick={() => onFeedback(messageId, "up")}
        disabled={disabled}
        className={clsx(iconButtonBase, activeDirection === "up" && "border-sky-500/70 bg-sky-500/10 text-sky-600 dark:text-sky-300")}
      >
        <ThumbsUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Thumbs down"
        onClick={() => onFeedback(messageId, "down")}
        disabled={disabled}
        className={clsx(iconButtonBase, activeDirection === "down" && "border-sky-500/70 bg-sky-500/10 text-sky-600 dark:text-sky-300")}
      >
        <ThumbsDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        title="Copy"
        onClick={() => onCopy(messageText)}
        className={iconButtonBase}
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}
