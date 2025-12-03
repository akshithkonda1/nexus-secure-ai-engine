import React from "react";
import type { ChatMessage } from "@/features/chat/context/ChatContext";
import ToronMessageActions from "./RyuzenMessageActions";

type Props = {
  message: ChatMessage;
  isAssistant: boolean;
  isPending?: boolean;
  onRetry?: () => void;
  onFeedback?: (direction: "up" | "down") => void;
  onCopy?: () => void;
  onShare?: () => void;
};

export const ToronMessageBubble: React.FC<Props> = ({
  message,
  isAssistant,
  isPending,
  onRetry,
  onFeedback,
  onCopy,
  onShare,
}) => {
  const showActions =
    isAssistant && !isPending && message.status !== "error" && !!onCopy;

  const baseClasses =
    "inline-flex max-w-[min(100%,72rem)] flex-col rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm border";

  const assistantClasses =
    "bg-bgElevated/85 text-textMuted border-borderStrong/80 backdrop-blur-xl ring-1 ring-sky-500/20";
  const userClasses =
    "bg-sky-500 text-textPrimary border-transparent shadow-md";

  const bubbleClasses = [
    baseClasses,
    isAssistant ? assistantClasses : userClasses,
  ].join(" ");

  if (isPending) {
    return (
      <div className={bubbleClasses}>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-bgElevated/70 px-3 py-1 text-[11px] text-textMuted">
            Toron is thinking…
          </span>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-1.5 w-1.5 rounded-full bg-bgSecondary"
                style={{
                  animation: "aurora-dot 1.2s infinite",
                  animationDelay: `${dot * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col gap-1">
      <div className={bubbleClasses}>
        <div className="space-y-2">
          {message.content && (
            <p className="whitespace-pre-wrap break-words text-[13px]">
              {message.content}
            </p>
          )}

          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-1 text-[10px] text-textMuted">
              {message.attachments.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-borderStrong bg-bgElevated/80 px-2 py-0.5"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {message.status === "error" && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="text-[11px] font-medium text-textMuted underline decoration-dotted hover:text-textMuted hover:decoration-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Retry with Toron
            </button>
          )}
        </div>
      </div>

      {showActions && (
        <div className="ml-1 mt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <ToronMessageActions
            onThumbsUp={onFeedback ? () => onFeedback("up") : undefined}
            onThumbsDown={onFeedback ? () => onFeedback("down") : undefined}
            onCopy={onCopy}
            onShare={onShare}
          />
        </div>
      )}
    </div>
  );
};

export default ToronMessageBubble;
