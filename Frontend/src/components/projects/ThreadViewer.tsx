import React from "react";
import { Thread } from "@/types/projects";

interface ThreadViewerProps {
  thread: Thread | null;
  onOpenInChat?: () => void;
}

export const ThreadViewer: React.FC<ThreadViewerProps> = ({ thread, onOpenInChat }) => {
  if (!thread) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-sm text-slate-500">
        Select a thread to preview sanitized messages.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-50">{thread.title}</h3>
          <p className="text-xs text-slate-500">
            {thread.messages.length} message{thread.messages.length === 1 ? "" : "s"} (sanitized)
          </p>
        </div>
        {onOpenInChat && (
          <button
            className="rounded border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            type="button"
            onClick={onOpenInChat}
          >
            Open in Chat
          </button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-6 text-sm">
        {thread.messages.length === 0 && (
          <p className="text-slate-500">No messages yet. Start chatting to build context.</p>
        )}
        {thread.messages.map((message, idx) => (
          <div
            key={`${message.timestamp}-${idx}`}
            className="rounded border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span className="uppercase tracking-wide text-slate-600 dark:text-slate-300">
                {message.role === "assistant" ? "Assistant" : "User"}
              </span>
              <span>{new Date(message.timestamp).toLocaleString()}</span>
            </div>
            <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-100">{message.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
