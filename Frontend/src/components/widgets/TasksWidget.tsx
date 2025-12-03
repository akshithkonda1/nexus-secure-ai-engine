import React from "react";
import { AlarmClock } from "lucide-react";
import { WorkspaceSchedule } from "@/types/workspace";

interface TasksWidgetProps {
  schedule: WorkspaceSchedule[];
  onChange: (next: WorkspaceSchedule[]) => void;
  onExpand: () => void;
}

const glassPanelClass =
  "bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong";

const TasksWidget: React.FC<TasksWidgetProps> = ({ schedule, onExpand }) => {
  const now = new Date();
  const currentHour = `${String(now.getHours()).padStart(2, "0")}:00`;

  return (
    <button
      type="button"
      onClick={onExpand}
      className={`w-full text-left focus:outline-none ${glassPanelClass}`}
    >
      <div className="flex items-center justify-between border-b border-glassBorder pb-3 text-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary">
          <AlarmClock className="h-4 w-4" /> Tasks
        </div>
        <span className="text-xs font-semibold text-textSecondary">AI timeline</span>
      </div>
      <div className="space-y-3 pt-3">
        {schedule.map((block) => (
          <div
            key={block.hour}
            className={`${glassPanelClass} p-4 shadow-none ${
              block.hour === currentHour ? "border-emerald-300 shadow-glassStrong" : ""
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
                <div key={item.id} className="rounded-xl border border-glassBorder bg-glass px-3 py-2">
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
