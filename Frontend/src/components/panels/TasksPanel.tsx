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

  const border = isDark ? "border-white/10" : "border-black/5";
  const surface = isDark ? "bg-neutral-900" : "bg-white";
  const textPrimary = isDark ? "text-neutral-100" : "text-neutral-900";
  const textSecondary = isDark ? "text-neutral-300" : "text-neutral-700";

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
                isDark ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-neutral-100 text-black hover:bg-neutral-200"
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
            <div className="flex items-center justify-between text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              <span>{block.hour}</span>
              <span className={`text-xs ${textSecondary}`}>{block.focus}</span>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {block.items.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-3 py-2 ${
                    isDark ? "border-white/10 bg-neutral-800 text-white" : "border-black/5 bg-neutral-50 text-black"
                  }`}
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className={`text-[11px] uppercase ${textSecondary}`}>{item.source}</p>
                </div>
              ))}
              <div
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  isDark ? "border-white/10 bg-neutral-800" : "border-black/5 bg-neutral-50"
                }`}
              >
                <input
                  value={draft[block.hour] || ""}
                  onChange={(e) => setDraft((prev) => ({ ...prev, [block.hour]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTask(block.hour)}
                  placeholder="Add task"
                  className={`w-full bg-transparent text-sm ${
                    isDark
                      ? "text-white placeholder:text-neutral-400"
                      : "text-black placeholder:text-neutral-500"
                  } focus:outline-none`}
                />
                <button
                  className={`rounded-full p-2 transition ${
                    isDark ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-emerald-300 text-black hover:bg-emerald-400"
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
