import React, { useState } from "react";
import { AlarmClock, Plus } from "lucide-react";
import { TaskItem, WorkspaceSchedule } from "@/types/workspace";

interface TasksPanelProps {
  schedule: WorkspaceSchedule[];
  onChange: (next: WorkspaceSchedule[]) => void;
  close?: () => void;
}

const TasksPanel: React.FC<TasksPanelProps> = ({ schedule, onChange, close }) => {
  const [draft, setDraft] = useState<Record<string, string>>({});

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
    <div className="rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-6 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
        <div className="flex items-center gap-2">
          <AlarmClock className="h-4 w-4" /> Tasks Panel
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-1 text-xs text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:bg-[var(--glass)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">Synced</span>
          {close && (
            <button
              onClick={close}
              className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-1 text-[11px] uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_70%,transparent)]"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {schedule.map((block) => (
          <div key={block.hour} className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-4 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--text)]">
              <span>{block.hour}</span>
              <span className="text-xs text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">{block.focus}</span>
            </div>
            <div className="mt-2 space-y-2 text-sm text-[var(--text)] dark:text-[var(--text)]">
              {block.items.map((item) => (
                <div key={item.id} className="rounded-xl bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-2 dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
                  <p>{item.title}</p>
                  <p className="text-[11px] uppercase text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">{item.source}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-xl bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-2 dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
                <input
                  value={draft[block.hour] || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [block.hour]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTask(block.hour)}
                  placeholder="Add task"
                  className="w-full bg-transparent text-sm text-[var(--text)] placeholder:text-black/50 focus:outline-none dark:text-[var(--text)] dark:placeholder:text-white/50"
                />
                <button
                  className="rounded-full bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] p-2 text-[var(--text)] transition hover:bg-black/20 dark:bg-[var(--glass)] dark:text-[var(--text)] dark:hover:bg-[color-mix(in_oklab,var(--glass)_85%,transparent)]"
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
