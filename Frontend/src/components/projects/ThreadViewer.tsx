import React from "react";
import { Thread } from "@/types/projects";

interface ThreadViewerProps {
  thread: Thread | null;
  onOpenInChat?: () => void;
}

export const ThreadViewer: React.FC<ThreadViewerProps> = ({ thread, onOpenInChat }) => {
  if (!thread) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-sm text-textSecondary">
        Select a thread to preview sanitized messages.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-borderLight px-6 py-4 dark:border-borderStrong">
        <div>
          <h3 className="text-lg font-semibold text-textPrimary dark:text-textMuted">{thread.title}</h3>
          <p className="text-xs text-textSecondary">
            {thread.messages.length} message{thread.messages.length === 1 ? "" : "s"} (sanitized)
          </p>
        </div>
        {onOpenInChat && (
          <button
            className="rounded border border-borderLight px-3 py-2 text-xs font-semibold text-textSecondary transition hover:bg-bgPrimary dark:border-borderStrong dark:text-textMuted dark:hover:bg-bgElevated"
            type="button"
            onClick={onOpenInChat}
          >
            Open in Chat
          </button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-6 text-sm">
        {thread.messages.length === 0 && (
          <p className="text-textSecondary">No messages yet. Start chatting to build context.</p>
        )}
        {thread.messages.map((message, idx) => (
          <div
            key={`${message.timestamp}-${idx}`}
            className="rounded border border-borderLight bg-bgPrimary p-4 shadow-sm dark:border-borderStrong dark:bg-bgElevated"
          >
            <div className="mb-1 flex items-center justify-between text-xs text-textSecondary">
              <span className="uppercase tracking-wide text-textSecondary dark:text-textMuted">
                {message.role === "assistant" ? "Assistant" : "User"}
              </span>
              <span>{new Date(message.timestamp).toLocaleString()}</span>
            </div>
            <div className="whitespace-pre-wrap text-textPrimary dark:text-textMuted">{message.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
