import React, { useState } from "react";
import { AlarmClock, Pencil, Plus } from "lucide-react";
import { TaskItem, WorkspaceSchedule } from "@/types/workspace";

interface TasksWidgetProps {
  schedule: WorkspaceSchedule[];
  onChange: (next: WorkspaceSchedule[]) => void;
  onExpand: () => void;
}

const TasksWidget: React.FC<TasksWidgetProps> = ({ schedule, onChange, onExpand }) => {
  const [editing, setEditing] = useState<Record<string, string>>({});

  const updateTask = (hour: string, task: TaskItem, value: string) => {
    const next = schedule.map((block) =>
      block.hour === hour
        ? {
            ...block,
            items: block.items.map((item) => (item.id === task.id ? { ...item, title: value } : item)),
          }
        : block,
    );
    onChange(next);
  };

  const addTask = (hour: string) => {
    const text = editing[hour]?.trim();
    if (!text) return;
    const next = schedule.map((block) =>
      block.hour === hour
        ? { ...block, items: [...block.items, { id: crypto.randomUUID(), title: text, source: "Manual" }] }
        : block,
    );
    onChange(next);
    setEditing((prev) => ({ ...prev, [hour]: "" }));
    window.dispatchEvent(new CustomEvent("toron-signal", { detail: { tasks: next } }));
  };

  const now = new Date();
  const currentHour = `${String(now.getHours()).padStart(2, "0")}:00`;

  return (
    <div
      className="relative rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-4 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl transition hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      onClick={onExpand}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-black/10 dark:ring-white/10" />
      <div className="mb-3 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">
        <div className="flex items-center gap-2">
          <AlarmClock className="h-4 w-4" /> Tasks
        </div>
        <span className="rounded-full bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-1 text-xs text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:bg-[var(--glass)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">AI schedule</span>
      </div>
      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
        {schedule.map((block) => (
          <div
            key={block.hour}
            className={`rounded-2xl border px-3 py-2 ${
              block.hour === currentHour
                ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-900 shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:text-emerald-50"
                : "border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:border-white/15 dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">{block.hour}</span>
                <span>{block.focus}</span>
              </div>
              {block.hour === currentHour && <span className="text-[11px] text-emerald-700 dark:text-emerald-200">Current</span>}
            </div>
            <div className="mt-2 space-y-1 text-xs text-[var(--text)] dark:text-[var(--text)]">
              {block.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-2 py-1 dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
                  <input
                    className="w-full bg-transparent text-[var(--text)] focus:outline-none dark:text-[var(--text)]"
                    value={item.title}
                    onChange={(e) => updateTask(block.hour, item, e.target.value)}
                  />
                  <span className="flex items-center gap-1 text-[10px] text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">
                    <Pencil className="h-3 w-3" />
                    {item.source}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-xl bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-2 py-1 dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
                <input
                  value={editing[block.hour] || ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, [block.hour]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTask(block.hour)}
                  placeholder="Add task"
                  className="w-full bg-transparent text-[var(--text)] placeholder:text-black/50 focus:outline-none dark:text-[var(--text)] dark:placeholder:text-white/50"
                />
                <button
                  className="rounded-full bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] p-1 text-[var(--text)] transition hover:bg-black/20 dark:bg-[var(--glass)] dark:text-[var(--text)] dark:hover:bg-[color-mix(in_oklab,var(--glass)_85%,transparent)]"
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

export default TasksWidget;
