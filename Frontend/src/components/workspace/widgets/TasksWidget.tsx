import { CheckSquare, Circle } from "lucide-react";

export interface TasksWidgetProps {
  className?: string;
}

const sampleTasks = [
  { id: '1', title: 'Review code changes', priority: 'high' as const, done: false },
  { id: '2', title: 'Update documentation', priority: 'medium' as const, done: false },
  { id: '3', title: 'Team sync meeting', priority: 'low' as const, done: true },
];

export default function TasksWidget({ className = "" }: TasksWidgetProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const incompleteTasks = sampleTasks.filter((t) => !t.done);
  const completedTasks = sampleTasks.filter((t) => t.done);

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Tasks</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Today</span>
      </header>

      <div className="space-y-2">
        {incompleteTasks.length > 0 &&
          incompleteTasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-start gap-2 rounded-lg bg-[var(--bg-elev)]/40 p-2 transition-colors hover:bg-[var(--bg-elev)]/60"
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
            </div>
          ))}

        {completedTasks.length > 0 && (
          <div className="space-y-2 border-t border-[var(--line-subtle)] pt-2">
            <p className="text-xs text-[var(--text-muted)]">
              Completed ({completedTasks.length})
            </p>
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-start gap-2 rounded-lg bg-[var(--bg-elev)]/20 p-2 opacity-60"
              >
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)] fill-current" />
                <span className="flex-1 text-sm text-[var(--text-muted)] line-through">
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {sampleTasks.length === 0 && (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No tasks yet
          </div>
        )}
      </div>
    </section>
  );
}
