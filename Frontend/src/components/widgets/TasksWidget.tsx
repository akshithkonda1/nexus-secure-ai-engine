import React from "react";
import { AlarmClock } from "lucide-react";
import { WorkspaceSchedule } from "@/types/workspace";

interface TasksWidgetProps {
  schedule: WorkspaceSchedule[];
  onChange: (next: WorkspaceSchedule[]) => void;
  onExpand: () => void;
}

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const TasksWidget: React.FC<TasksWidgetProps> = ({ schedule, onExpand }) => {
  const now = new Date();
  const currentHour = `${String(now.getHours()).padStart(2, "0")}:00`;

  return (
    <button
      type="button"
      onClick={onExpand}
      className={`w-full text-left focus:outline-none ${surfaceClass}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-300/60 pb-3 text-sm dark:border-neutral-700/60">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary">
          <AlarmClock className="h-4 w-4" /> Tasks
        </div>
        <span className="text-xs font-semibold text-textSecondary">AI timeline</span>
      </div>
      <div className="space-y-3 pt-3">
        {schedule.map((block) => (
          <div
            key={block.hour}
            className={`${surfaceClass} p-4 ${
              block.hour === currentHour ? "border-emerald-300" : ""
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary">
              <div className="flex items-center gap-2">
                <span className="text-xs text-textSecondary">{block.hour}</span>
                <span>{block.focus}</span>
              </div>
              {block.hour === currentHour && (
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-textPrimary">Now</span>
              )}
            </div>
            <div className="mt-2 space-y-2 text-sm text-textPrimary">
              {block.items.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-neutral-300/50 bg-white/85 px-3 py-2 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85"
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-textMuted">{item.source}</p>
                </div>
              ))}
              {!block.items.length && (
                <p className="text-xs text-textMuted">No tasks scheduled.</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-b-2xl pt-3 text-sm text-textSecondary">
        <p>Drag, reorder, and build AI assisted blocks in the full task view.</p>
      </div>
    </button>
  );
};

export default TasksWidget;
