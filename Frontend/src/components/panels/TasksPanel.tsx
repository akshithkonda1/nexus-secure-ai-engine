import React, { useState } from "react";
import { TaskItem, WorkspaceSchedule } from "@/types/workspace";
import { AlarmClock, Plus, Sparkles } from "lucide-react";

interface TasksPanelProps {
  schedule: WorkspaceSchedule[];
  onChange: (next: WorkspaceSchedule[]) => void;
}

const TasksPanel: React.FC<TasksPanelProps> = ({ schedule, onChange }) => {
  const [newHour, setNewHour] = useState("14:00");
  const [newTask, setNewTask] = useState("");

  const addBlock = () => {
    const text = newTask.trim();
    if (!text) return;
    const next: WorkspaceSchedule[] = [
      ...schedule,
      { hour: newHour, focus: "Custom block", items: [{ id: crypto.randomUUID(), title: text, source: "Manual" }] },
    ];
    onChange(next);
    setNewTask("");
    window.dispatchEvent(new CustomEvent("toron-signal", { detail: { tasks: next } }));
  };

  const markComplete = (hour: string, task: TaskItem) => {
    const next = schedule.map((block) =>
      block.hour === hour
        ? { ...block, items: block.items.map((i) => (i.id === task.id ? { ...i, source: "Completed" } : i)) }
        : block,
    );
    onChange(next);
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
          <AlarmClock className="h-4 w-4" /> Tasks Panel
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/10 p-1">
          <input
            value={newHour}
            onChange={(e) => setNewHour(e.target.value)}
            className="w-24 rounded-full bg-black/30 px-3 py-2 text-xs text-white focus:outline-none"
            placeholder="14:00"
          />
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-40 rounded-full bg-black/30 px-3 py-2 text-xs text-white focus:outline-none"
            placeholder="Add task"
            onKeyDown={(e) => e.key === "Enter" && addBlock()}
          />
          <button
            className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs text-white transition hover:bg-white/25"
            onClick={addBlock}
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {schedule.map((block) => (
          <div key={block.hour} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-white/90">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">{block.hour}</span>
                <span>{block.focus}</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-emerald-200">
                <Sparkles className="h-3 w-3" /> AI aligned
              </span>
            </div>
            <div className="mt-2 space-y-2 text-sm text-white/80">
              {block.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                  <span>{item.title}</span>
                  <button
                    className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-white transition hover:bg-white/20"
                    onClick={() => markComplete(block.hour, item)}
                  >
                    {item.source === "Completed" ? "Done" : "Complete"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPanel;
