import React, { useMemo } from "react";
import DOMPurify from "dompurify";
import { cn, formatBytes } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import type { ChatMessage } from "@/hooks/useChatStore";

type Props = {
  message: ChatMessage;
};

export function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const sanitizedContent = useMemo(() => {
    if (!message.content) return "";
    return DOMPurify.sanitize(renderMarkdown(message.content));
  }, [message.content]);
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}> 
      <div
        className={cn(
          "relative max-w-[min(640px,90vw)] rounded-3xl border px-5 py-4 text-[15px] leading-relaxed shadow-sm transition-colors",
          isUser
            ? "bg-[color:var(--brand)] text-white border-transparent"
            : "bg-[rgb(var(--surface))] text-[rgb(var(--text))] border-[color:rgba(var(--border))]"
        )}
      >
        {message.status === "loading" && !message.content ? (
          <div className="flex items-center gap-2 text-sm opacity-80">
            <span className="h-2 w-2 animate-bounce rounded-full bg-[color:rgba(var(--text)/0.8)] [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[color:rgba(var(--text)/0.8)] [animation-delay:-0.05s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[color:rgba(var(--text)/0.8)]" />
          </div>
        ) : (
          <div
            className="markdown-body text-inherit"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.attachments.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-3 py-1 text-xs font-medium text-[rgb(var(--text))] shadow-sm transition hover:border-[color:var(--ring)]"
              >
                <span className="h-2 w-2 rounded-full bg-[color:var(--brand)]" />
                <span className="truncate max-w-[180px]">{file.name}</span>
                <span className="opacity-70">{formatBytes(file.size)}</span>
              </a>
            ))}
          </div>
        )}

        {message.status === "error" && (
          <div className="mt-3 text-xs font-medium text-red-500">Failed to deliver. Try again.</div>
        )}
      </div>
    </div>
  );
}
