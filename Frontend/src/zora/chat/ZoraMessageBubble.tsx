import React from "react";
import type { ChatMessage } from "@/features/chat/context/ChatContext";
import ZoraMessageActions from "./ZoraMessageActions";

type Props = {
  message: ChatMessage;
  isAssistant: boolean;
  isPending?: boolean;
  onRetry?: () => void;
  onFeedback?: (direction: "up" | "down") => void;
  onCopy?: () => void;
  onShare?: () => void;
};

const ZoraMessageBubble: React.FC<Props> = ({
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
    "inline-flex max-w-[min(96%,60rem)] flex-col rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm border";

  const assistantClasses =
    "bg-slate-900/80 text-slate-50 border-slate-700/80 backdrop-blur-xl ring-1 ring-sky-500/20";
  const userClasses =
    "bg-sky-500 text-white border-transparent shadow-md";

  const bubbleClasses = [
    baseClasses,
    isAssistant ? assistantClasses : userClasses,
  ].join(" ");

  if (isPending) {
    return (
      <div className={bubbleClasses}>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200">
            Zora Aurora is thinking…
          </span>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-1.5 w-1.5 rounded-full bg-slate-400"
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
            <div className="flex flex-wrap gap-1 text-[10px] text-slate-200">
              {message.attachments.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-slate-600 bg-slate-900/80 px-2 py-0.5"
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
              className="text-[11px] font-medium text-slate-200 underline decoration-dotted hover:text-slate-50 hover:decoration-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              Retry
            </button>
          )}
        </div>
      </div>
      {showActions && (
        <div className="ml-1 mt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <ZoraMessageActions
            onThumbsUp={
              onFeedback ? () => onFeedback("up") : undefined
            }
            onThumbsDown={
              onFeedback ? () => onFeedback("down") : undefined
            }
            onCopy={onCopy}
            onShare={onShare}
          />
        </div>
      )}
    </div>
  );
};

export default ZoraMessageBubble;
