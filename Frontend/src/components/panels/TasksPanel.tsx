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

  const panelShell =
    "bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong";

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
    <div className={`flex h-full flex-col gap-4 ${panelShell}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2 font-semibold text-textPrimary">
          <AlarmClock className="h-4 w-4" /> Tasks Timeline
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-glassBorder px-3 py-1 text-xs font-semibold text-textSecondary">Synced</span>
          {close && (
            <button
              onClick={close}
              className="rounded-full border border-glassBorder px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-glassBorderStrong"
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
            className={`${panelShell} p-4 shadow-none`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary">
              <span>{block.hour}</span>
              <span className="text-xs text-textSecondary">{block.focus}</span>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {block.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-glassBorder bg-glass px-3 py-2 text-textPrimary"
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-[11px] uppercase text-textMuted">{item.source}</p>
                </div>
              ))}
              <div
                className="flex items-center gap-2 rounded-xl border border-glassBorder bg-glass px-3 py-2"
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
