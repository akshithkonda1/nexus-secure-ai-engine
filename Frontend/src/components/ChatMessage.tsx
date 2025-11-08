import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn, formatBytes } from "@/lib/utils";
import type { ChatMessage } from "@/hooks/useChatStore";

const markdownComponents = {
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline ? (
      <pre
        className={cn(
          "mt-3 overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.06)] bg-[rgba(9,11,30,0.9)] p-4 text-sm text-white shadow-soft",
          "dark:border-[rgba(255,255,255,0.05)]"
        )}
        {...props}
      >
        <code className={cn("font-mono", match ? className : "")}>{children}</code>
      </pre>
    ) : (
      <code
        className={cn(
          "rounded bg-[rgba(0,133,255,0.1)] px-1.5 py-0.5 font-mono text-[13px] text-[color:var(--brand)]"
        )}
        {...props}
      >
        {children}
      </code>
    );
  }
};

type Props = {
  message: ChatMessage;
};

export function ChatMessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}> 
      <div
        className={cn(
          "relative max-w-[min(640px,90vw)] rounded-3xl border px-5 py-4 text-[15px] leading-relaxed shadow-card transition-colors",
          isUser
            ? "bg-[color:var(--brand)] text-white border-transparent"
            : "bg-[rgba(255,255,255,0.82)] text-[rgb(var(--text))] border-[rgb(var(--border))] dark:bg-[rgba(9,11,30,0.82)] dark:text-white dark:border-[rgba(255,255,255,0.08)]"
        )}
      >
        {message.status === "loading" && !message.content ? (
          <div className="flex items-center gap-2 text-sm opacity-80">
            <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.05s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
          </div>
        ) : (
          <div className="markdown-body text-inherit">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.attachments.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.6)] bg-white/40 px-3 py-1 text-xs font-medium text-[rgb(9,11,30)] shadow-sm backdrop-blur transition hover:shadow-glow dark:border-[rgba(255,255,255,0.08)] dark:bg-white/5 dark:text-white"
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
