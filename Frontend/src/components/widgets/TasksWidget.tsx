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
      className="relative rounded-[32px] border border-white/10 bg-white/10 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl transition hover:scale-[1.02] hover:border-white/20"
      onClick={onExpand}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-white/10" />
      <div className="mb-3 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-white/60">
        <div className="flex items-center gap-2">
          <AlarmClock className="h-4 w-4" /> Tasks
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">AI schedule</span>
      </div>
      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
        {schedule.map((block) => (
          <div
            key={block.hour}
            className={`rounded-2xl border px-3 py-2 ${
              block.hour === currentHour ? "border-emerald-400/50 bg-emerald-500/10" : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-white/90">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">{block.hour}</span>
                <span>{block.focus}</span>
              </div>
              {block.hour === currentHour && <span className="text-[11px] text-emerald-200">Current</span>}
            </div>
            <div className="mt-2 space-y-1 text-xs text-white/80">
              {block.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-black/30 px-2 py-1">
                  <input
                    className="w-full bg-transparent focus:outline-none"
                    value={item.title}
                    onChange={(e) => updateTask(block.hour, item, e.target.value)}
                  />
                  <span className="flex items-center gap-1 text-[10px] text-white/60">
                    <Pencil className="h-3 w-3" />
                    {item.source}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-xl bg-white/5 px-2 py-1">
                <input
                  value={editing[block.hour] || ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, [block.hour]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTask(block.hour)}
                  placeholder="Add task"
                  className="w-full bg-transparent text-white/80 placeholder:text-white/40 focus:outline-none"
                />
                <button
                  className="rounded-full bg-white/10 p-1 text-white/80 transition hover:bg-white/20"
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
