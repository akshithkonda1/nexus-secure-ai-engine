import React, { useState } from "react";
import { AlarmClock, Plus } from "lucide-react";
import { WorkspaceSchedule } from "@/types/workspace";
import { useTheme } from "@/theme/ThemeProvider";

interface TasksPanelProps {
  schedule: WorkspaceSchedule[];
  onChange: (next: WorkspaceSchedule[]) => void;
  close?: () => void;
}

const TasksPanel: React.FC<TasksPanelProps> = ({ schedule, onChange, close }) => {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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

  const border = isDark ? "border-borderLight/10" : "border-borderLight/5";
  const surface = isDark ? "bg-bgElevated" : "bg-bgPrimary";
  const textPrimary = isDark ? "text-textMuted" : "text-textPrimary";
  const textSecondary = isDark ? "text-textMuted" : "text-textSecondary";

  return (
    <div className={`flex h-full flex-col gap-4 rounded-3xl border ${border} ${surface} p-6 shadow-xl`}>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm uppercase tracking-[0.2em]">
        <div className={`flex items-center gap-2 font-semibold ${textPrimary}`}>
          <AlarmClock className="h-4 w-4" /> Tasks Timeline
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${textSecondary}`}>Synced</span>
          {close && (
            <button
              onClick={close}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                isDark ? "bg-bgElevated text-textPrimary hover:bg-bgSecondary" : "bg-bgPrimary text-textPrimary hover:bg-bgPrimary"
              }`}
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
            className={`rounded-2xl border ${border} ${surface} p-4 shadow-sm`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary dark:text-textMuted">
              <span>{block.hour}</span>
              <span className={`text-xs ${textSecondary}`}>{block.focus}</span>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {block.items.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-2 ${
                    isDark ? "border-borderLight/10 bg-bgElevated text-textPrimary" : "border-borderLight/5 bg-bgPrimary text-textPrimary"
                  }`}
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className={`text-[11px] uppercase ${textSecondary}`}>{item.source}</p>
                </div>
              ))}
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  isDark ? "border-borderLight/10 bg-bgElevated" : "border-borderLight/5 bg-bgPrimary"
                }`}
              >
                <input
                  value={draft[block.hour] || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [block.hour]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTask(block.hour)}
                  placeholder="Add task"
                  className={`w-full bg-transparent text-sm ${
                    isDark
                      ? "text-textPrimary placeholder:text-textMuted"
                      : "text-textPrimary placeholder:text-textSecondary"
                  } focus:outline-none`}
                />
                <button
                  className={`rounded-full p-2 transition ${
                    isDark ? "bg-emerald-600 text-textPrimary hover:bg-emerald-500" : "bg-emerald-300 text-textPrimary hover:bg-emerald-400"
                  }`}
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
