import { FormEvent, useMemo, useState } from "react";
import { CheckSquare2, Plus, Sparkle } from "lucide-react";

type TasksWidgetProps = {
  className?: string;
};

type Task = {
  id: number;
  title: string;
  done: boolean;
};

const starterTasks: Task[] = [
  { id: 1, title: "Set next milestone", done: false },
  { id: 2, title: "Review blockers", done: true },
  { id: 3, title: "Prep calm update", done: false },
];

export default function TasksWidget({ className }: TasksWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [draft, setDraft] = useState("");

  const progress = useMemo(() => {
    const completed = tasks.filter((task) => task.done).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setTasks((prev) => [...prev, { id: Date.now(), title: draft.trim(), done: false }]);
    setDraft("");
  };

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  return (
    <section
      aria-label="Tasks widget"
      className={`flex min-w-[clamp(260px,22vw,360px)] flex-col gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-surface)]/82 p-4 text-[var(--text)] shadow-[0_12px_36px_rgba(15,23,42,0.07)] backdrop-blur-lg transition-colors dark:shadow-[0_12px_36px_rgba(0,0,0,0.25)] ${className ?? ""}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-muted)]/90 text-[var(--accent)] ring-1 ring-[var(--line-subtle)]">
            <CheckSquare2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Tasks</p>
            <p className="text-xs text-[var(--text-muted)]">Today</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[var(--bg-elev)]/90 px-3 py-1 text-xs text-[var(--text-muted)]">
          <Sparkle className="h-4 w-4" />
          {progress}%
        </span>
      </header>

      <form onSubmit={handleAdd} className="flex items-center gap-2 rounded-xl border border-[var(--line-subtle)] bg-[var(--bg-elev)]/95 px-3 py-2 shadow-inner">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Quick add"
          className="w-full bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
        />
        <button
          type="submit"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--text-inverse)] shadow-sm transition hover:brightness-110"
          aria-label="Add task"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => toggleTask(task.id)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
              task.done
                ? "bg-[var(--bg-elev)]/90 text-[var(--muted)] line-through"
                : "bg-[var(--layer-muted)]/88 text-[var(--text)] shadow-inner"
            }`}
          >
            <span>{task.title}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${task.done ? "bg-[var(--line-strong)]" : "bg-[var(--accent)]"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
