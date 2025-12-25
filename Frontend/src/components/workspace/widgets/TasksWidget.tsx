import { useState } from "react";
import { CheckSquare, Plus, X } from "lucide-react";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { useWindowManager } from "../../../hooks/useWindowManager";

export interface TasksWidgetProps {
  className?: string;
}

export default function TasksWidget({ className }: TasksWidgetProps) {
  const { tasks, addTask, toggleTask, removeTask } = useWorkspace();
  const { openWindow } = useWindowManager();
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Derived state
  const incompleteTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  // Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle("");
    }
  };

  // Helper
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

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between cursor-pointer hover:bg-[var(--bg-elev)]/30 -mx-2 -mt-2 px-2 pt-2 pb-1 rounded-t-xl transition-colors"
        onClick={() => openWindow('tasks')}
        title="Click to expand"
      >
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Tasks</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Today</span>
      </header>

      {/* Add new task form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Quick add"
          className="flex-1 rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-surface)]/50 px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="shrink-0 rounded-lg bg-[var(--accent)] p-2 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      {/* Task list */}
      <div className="space-y-2">
        {/* Incomplete tasks */}
        {incompleteTasks.length > 0 &&
          incompleteTasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-start gap-2 rounded-lg bg-[var(--bg-elev)]/40 p-2 transition-colors hover:bg-[var(--bg-elev)]/60"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--line-subtle)] bg-[var(--bg-surface)] text-[var(--accent)]"
              />
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
              <button
                onClick={() => removeTask(task.id)}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                type="button"
              >
                <X className="h-3.5 w-3.5 text-[var(--text-muted)] hover:text-[var(--text)]" />
              </button>
            </div>
          ))}

        {/* Completed tasks */}
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
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--line-subtle)] bg-[var(--bg-surface)] text-[var(--accent)]"
                />
                <span className="flex-1 text-sm text-[var(--text-muted)] line-through">
                  {task.title}
                </span>
                <button
                  onClick={() => removeTask(task.id)}
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  type="button"
                >
                  <X className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No tasks yet. Add one above!
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 border-t border-[var(--line-subtle)] pt-2">
        <button
          onClick={() => addTask("Set next milestone", "medium")}
          className="rounded-md bg-[var(--bg-elev)]/50 px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
          type="button"
        >
          Set next milestone
        </button>
        <button
          onClick={() => addTask("Review blockers", "low")}
          className="rounded-md bg-[var(--bg-elev)]/50 px-2 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
          type="button"
        >
          Review blockers
        </button>
      </div>
    </section>
  );
}
