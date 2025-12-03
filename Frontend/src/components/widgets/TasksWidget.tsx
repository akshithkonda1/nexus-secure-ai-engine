import React from "react";
import { AlarmClock } from "lucide-react";
import { WorkspaceSchedule } from "@/types/workspace";
import { useTheme } from "@/theme/ThemeProvider";

interface TasksWidgetProps {
  schedule: WorkspaceSchedule[];
  onChange: (next: WorkspaceSchedule[]) => void;
  onExpand: () => void;
}

const TasksWidget: React.FC<TasksWidgetProps> = ({ schedule, onExpand }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const now = new Date();
  const currentHour = `${String(now.getHours()).padStart(2, "0")}:00`;

  return (
    <button
      type="button"
      onClick={onExpand}
      className={`w-full rounded-3xl border text-left shadow-sm transition hover:scale-[1.01] ${
        isDark ? "border-borderLight/10 bg-bgElevated text-textPrimary" : "border-borderLight/5 bg-bgPrimary text-textPrimary"
      }`}
    >
      <div className="flex items-center justify-between border-b px-5 py-4 text-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary dark:text-textMuted">
          <AlarmClock className="h-4 w-4" /> Tasks
        </div>
        <span className="text-xs font-semibold text-textSecondary dark:text-textMuted">AI timeline</span>
      </div>
      <div className="space-y-3 px-5 py-4">
        {schedule.map((block) => (
          <div
            key={block.hour}
            className={`rounded-2xl border px-4 py-3 shadow-sm ${
              block.hour === currentHour
                ? isDark
                  ? "border-emerald-400 bg-bgElevated text-textPrimary"
                  : "border-emerald-300 bg-emerald-50 text-textPrimary"
                : isDark
                  ? "border-borderLight/10 bg-bgElevated"
                  : "border-borderLight/5 bg-bgPrimary"
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary dark:text-textMuted">
              <div className="flex items-center gap-2">
                <span className="text-xs text-textSecondary dark:text-textMuted">{block.hour}</span>
                <span>{block.focus}</span>
              </div>
              {block.hour === currentHour && (
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-textPrimary">Now</span>
              )}
            </div>
            <div className="mt-2 space-y-2 text-sm text-textPrimary dark:text-textMuted">
              {block.items.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl px-3 py-2 ${isDark ? "bg-bgElevated text-textPrimary" : "bg-bgPrimary text-textPrimary"}`}
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-textSecondary dark:text-textMuted">{item.source}</p>
                </div>
              ))}
              {!block.items.length && (
                <p className="text-xs text-textSecondary dark:text-textMuted">No tasks scheduled.</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className={`rounded-b-3xl px-5 py-3 text-sm ${isDark ? "bg-bgElevated" : "bg-bgPrimary"}`}>
        <p className="text-textSecondary dark:text-textMuted">Drag, reorder, and build AI assisted blocks in the full task view.</p>
      </div>
    </button>
  );
};

export default TasksWidget;
