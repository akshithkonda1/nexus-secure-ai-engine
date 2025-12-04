import React, { useState } from "react";
import { AlarmClock, Plus } from "lucide-react";
import { WorkspaceSchedule } from "@/types/workspace";

interface TasksPanelProps {
  schedule: WorkspaceSchedule[];
  onChange: (next: WorkspaceSchedule[]) => void;
  close?: () => void;
}

const TasksPanel: React.FC<TasksPanelProps> = ({ schedule, onChange, close }) => {
  const [draft, setDraft] = useState<Record<string, string>>({});

  const surfaceClass =
    "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

  const addTask = (hour: string) => {
    const text = draft[hour]?.trim();
    if (!text) return;
    const updated = schedule.map((block) =>
      block.hour === hour
        ? { ...block, items: [...block.items, { id: crypto.randomUUID(), title: text, source: "Manual" }] }
        : block,
    );
    onChange(updated);
    setDraft((prev) => ({ ...prev, [hour]: "" }));
  };

  return (
    <div className={`flex h-full flex-col gap-4 ${surfaceClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2 font-semibold text-textPrimary">
          <AlarmClock className="h-4 w-4" /> Tasks Timeline
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-neutral-300/50 px-3 py-1 text-xs font-semibold text-textSecondary dark:border-neutral-700/50">Synced</span>
          {close && (
            <button
              onClick={close}
              className="rounded-full border border-neutral-300/50 px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-neutral-400 dark:border-neutral-700/50 dark:hover:border-neutral-600"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {schedule.map((block) => (
          <div
            key={block.hour}
            className={`${surfaceClass} p-4`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary">
              <span>{block.hour}</span>
              <span className="text-xs text-textSecondary">{block.focus}</span>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {block.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-neutral-300/50 bg-white/85 px-3 py-2 text-textPrimary backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85"
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-[11px] uppercase text-textMuted">{item.source}</p>
                </div>
              ))}
              <div
                className="flex items-center gap-2 rounded-xl border border-neutral-300/50 bg-white/85 px-3 py-2 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85"
              >
                <input
                  value={draft[block.hour] || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [block.hour]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTask(block.hour)}
                  placeholder="Add task"
                  className="w-full bg-transparent text-sm text-textPrimary placeholder:text-textMuted focus:outline-none"
                />
                <button
                  className="rounded-full bg-emerald-500 p-2 text-textPrimary transition hover:bg-emerald-400"
                  onClick={() => addTask(block.hour)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPanel;
