import React from "react";

const tasks = [
  { title: "Review onboarding flow", status: "In Progress" },
  { title: "Draft weekly summary", status: "Todo" },
  { title: "Refine persona prompts", status: "Blocked" },
];

const statusStyles: Record<string, string> = {
  "In Progress": "bg-amber-500/15 text-amber-400",
  Todo: "bg-bgSecondary/20 text-textMuted",
  Blocked: "bg-rose-500/15 text-rose-400",
};

const TasksWidget: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] p-6 shadow-lg shadow-black/5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Tasks</h3>
        <button className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300">Add Task</button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.title}
            className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-bgElevated/10 px-4 py-3 text-sm text-[var(--text-primary)]"
          >
            <span className="font-medium">{task.title}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status]}`}>
              {task.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksWidget;
