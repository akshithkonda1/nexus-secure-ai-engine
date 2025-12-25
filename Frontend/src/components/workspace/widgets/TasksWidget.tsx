import { CheckSquare, Circle } from "lucide-react";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { useWindowManager } from "../../../hooks/useWindowManager";

export interface TasksWidgetProps {
  className?: string;
}

export default function TasksWidget({ className = "" }: TasksWidgetProps) {
  const tasks = useWorkspace((state) => state.tasks);
  const toggleTask = useWorkspace((state) => state.toggleTask);
  const openWindow = useWindowManager((state) => state.openWindow);

  const getPriorityColor = (priority: number) => {
    if (priority >= 75) return "bg-red-500";
    if (priority >= 50) return "bg-orange-500";
    return "bg-blue-500";
  };

  const incompleteTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  const handleHeaderClick = () => {
    openWindow('tasks');
  };

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      <header
        className="flex items-center justify-between cursor-pointer hover:bg-[var(--bg-elev)]/20 -mx-2 -mt-2 px-2 pt-2 pb-1 rounded-t-xl transition-colors"
        onClick={handleHeaderClick}
        title="Click to expand"
      >
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Tasks</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Today</span>
      </header>

      <div className="space-y-2">
        {incompleteTasks.length > 0 &&
          incompleteTasks.slice(0, 3).map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="group flex w-full items-start gap-2 rounded-lg bg-[var(--bg-elev)]/40 p-2 transition-colors hover:bg-[var(--bg-elev)]/60 text-left"
            >
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${getPriorityColor(
                      task.priority
                    )}`}
                  />
                  <span className="text-sm text-[var(--text)]">{task.title}</span>
                </div>
              </div>
            </button>
          ))}

        {completedTasks.length > 0 && (
          <div className="space-y-2 border-t border-[var(--line-subtle)] pt-2">
            <p className="text-xs text-[var(--text-muted)]">
              Completed ({completedTasks.length})
            </p>
            {completedTasks.slice(0, 2).map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="group flex w-full items-start gap-2 rounded-lg bg-[var(--bg-elev)]/20 p-2 opacity-60 text-left"
              >
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)] fill-current" />
                <span className="flex-1 text-sm text-[var(--text-muted)] line-through">
                  {task.title}
                </span>
              </button>
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No tasks yet
          </div>
        )}
      </div>
    </section>
  );
}
