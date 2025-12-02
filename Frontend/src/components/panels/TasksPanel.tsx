import React, { useState } from "react";
import { AlarmClock, Plus } from "lucide-react";
import { TaskItem, WorkspaceSchedule } from "@/types/workspace";

interface TasksPanelProps {
  schedule: WorkspaceSchedule[];
  onChange: (next: WorkspaceSchedule[]) => void;
}

const TasksPanel: React.FC<TasksPanelProps> = ({ schedule, onChange }) => {
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
    <div className="rounded-[32px] border border-black/10 bg-black/5 p-6 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
        <div className="flex items-center gap-2">
          <AlarmClock className="h-4 w-4" /> Tasks Panel
        </div>
        <span className="rounded-full bg-black/10 px-3 py-1 text-xs text-black/70 dark:bg-white/10 dark:text-white/70">Synced</span>
      </div>
      <div className="space-y-3">
        {schedule.map((block) => (
          <div key={block.hour} className="rounded-2xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between text-sm font-semibold text-black dark:text-white">
              <span>{block.hour}</span>
              <span className="text-xs text-black/60 dark:text-white/60">{block.focus}</span>
            </div>
            <div className="mt-2 space-y-2 text-sm text-black/80 dark:text-white/80">
              {block.items.map((item) => (
                <div key={item.id} className="rounded-xl bg-black/5 px-3 py-2 dark:bg-white/5">
                  <p>{item.title}</p>
                  <p className="text-[11px] uppercase text-black/60 dark:text-white/60">{item.source}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2 dark:bg-white/5">
                <input
                  value={draft[block.hour] || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [block.hour]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTask(block.hour)}
                  placeholder="Add task"
                  className="w-full bg-transparent text-sm text-black/80 placeholder:text-black/50 focus:outline-none dark:text-white/80 dark:placeholder:text-white/50"
                />
                <button
                  className="rounded-full bg-black/10 p-2 text-black/80 transition hover:bg-black/20 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
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
