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
    <div className="border-r border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-900/60">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">Threads</h3>
        <button
          className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
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
                ? "bg-white font-semibold shadow-inner dark:bg-slate-800"
                : "hover:bg-white dark:hover:bg-slate-800/60",
            ].join(" ")}
            type="button"
            onClick={() => onSelect(thread.id)}
          >
            <div className="truncate text-slate-800 dark:text-slate-50">{thread.title}</div>
            <div className="text-xs text-slate-500">
              {thread.messages.length} message{thread.messages.length === 1 ? "" : "s"}
            </div>
          </button>
        ))}
        {threads.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-slate-500">
            No threads yet. Create one to start saving context.
          </div>
        )}
      </div>
    </div>
  );
};
