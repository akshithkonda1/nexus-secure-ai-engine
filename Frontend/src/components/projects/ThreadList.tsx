import React from "react";
import { Thread } from "@/types/projects";

interface ThreadListProps {
  threads: Thread[];
  activeThreadId?: string;
  onSelect: (threadId: string) => void;
  onCreate: () => void;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  activeThreadId,
  onSelect,
  onCreate,
}) => {
  return (
    <div className="border-r border-borderLight bg-bgPrimary dark:border-borderStrong/80 dark:bg-bgElevated/60">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-textSecondary dark:text-textMuted">Threads</h3>
        <button
          className="rounded border border-borderLight px-2 py-1 text-xs font-medium text-textSecondary transition hover:bg-bgPrimary dark:border-borderStrong dark:text-textMuted dark:hover:bg-bgElevated"
          onClick={onCreate}
          type="button"
        >
          + New
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        {threads.map((thread) => (
          <button
            key={thread.id}
            className={[
              "block w-full px-4 py-3 text-left text-sm transition",
              thread.id === activeThreadId
                ? "bg-bgPrimary font-semibold shadow-inner dark:bg-bgElevated"
                : "hover:bg-bgPrimary dark:hover:bg-bgElevated/60",
            ].join(" ")}
            type="button"
            onClick={() => onSelect(thread.id)}
          >
            <div className="truncate text-textPrimary dark:text-textMuted">{thread.title}</div>
            <div className="text-xs text-textSecondary">
              {thread.messages.length} message{thread.messages.length === 1 ? "" : "s"}
            </div>
          </button>
        ))}
        {threads.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-textSecondary">
            No threads yet. Create one to start saving context.
          </div>
        )}
      </div>
    </div>
  );
};
