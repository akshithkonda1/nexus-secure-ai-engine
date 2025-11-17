"use client";

import clsx from "clsx";
import React from "react";

import { ChatMessage } from "@/features/chat/context/ChatContext";

import { formatTime } from "./utils";

type ZoraMessageBubbleProps = {
  message: ChatMessage;
  isAssistant: boolean;
  onRetry?(message: ChatMessage): void;
  children?: React.ReactNode;
};

export function ZoraMessageBubble({
  message,
  isAssistant,
  onRetry,
  children,
}: ZoraMessageBubbleProps) {
  const attachments = message.attachments ?? [];
  const isPending = isAssistant && message.status === "pending";
  const isError = message.status === "error";

  return (
    <div
      className={clsx(
        "flex w-full flex-col gap-1 text-sm",
        isAssistant ? "items-start" : "items-end",
      )}
    >
      <div
        className={clsx(
          "max-w-full rounded-3xl border px-4 py-3 text-sm shadow-sm backdrop-blur-xl md:max-w-2xl",
          isAssistant
            ? "bg-white/10 text-slate-900 dark:text-slate-100 border-slate-200/70 dark:bg-slate-900/40 dark:border-slate-700/70"
            : "bg-sky-500 text-white border-sky-400/80 dark:bg-sky-500",
        )}
      >
        {isPending ? (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200">
            <span>Zora is thinking…</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1.5 w-1.5 rounded-full bg-current"
                  style={{
                    animation: "aurora-dot 1.4s ease-in-out infinite",
                    animationDelay: `${dot * 0.18}s`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-[13px] leading-relaxed text-current">
            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1 text-[11px] text-current/80">
                {attachments.map((name) => (
                  <span
                    key={name}
                    className={clsx(
                      "rounded-full border px-2 py-0.5",
                      isAssistant
                        ? "border-white/40 bg-white/10"
                        : "border-white/70 bg-white/20 text-white",
                    )}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
            {isError && onRetry ? (
              <button
                type="button"
                onClick={() => onRetry(message)}
                className="text-xs font-semibold text-slate-700 underline decoration-dotted hover:text-slate-900 focus:outline-none dark:text-slate-200 dark:hover:text-white"
              >
                Retry
              </button>
            ) : null}
          </div>
        )}
      </div>
      {children ? (
        <div
          className={clsx(
            "w-full",
            isAssistant ? "justify-start" : "justify-end",
            "flex",
          )}
        >
          {children}
        </div>
      ) : null}
      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
        {formatTime(message.createdAt)}
        {isError ? " · delivery failed" : ""}
      </span>
    </div>
  );
}
