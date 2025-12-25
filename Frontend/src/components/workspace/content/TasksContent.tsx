/**
 * Tasks Content Component
 * Pure content for Tasks window (no shell)
 */

import { FormEvent, useMemo, useState } from 'react';
import { Plus, Sparkle } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

type TasksContentProps = {
  className?: string;
};

export default function TasksContent({ className }: TasksContentProps) {
  const tasks = useWorkspace(state => state.tasks);
  const addTask = useWorkspace(state => state.addTask);
  const toggleTask = useWorkspace(state => state.toggleTask);
  const [draft, setDraft] = useState('');

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((task) => task.done).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    addTask({
      title: draft.trim(),
      done: false,
      priority: 50,
      type: 'work',
    });
    setDraft('');
  };

  const handleToggleTask = (id: string) => {
    toggleTask(id);
  };

  return (
    <div className={`flex h-full flex-col gap-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Today</p>
        <span className="flex items-center gap-1 rounded-full bg-[var(--bg-elev)] px-3 py-1 text-xs text-[var(--text-muted)]">
          <Sparkle className="h-4 w-4" />
          {progress}%
        </span>
      </div>

      <form
        onSubmit={handleAdd}
        className="flex items-center gap-2 rounded-xl border border-[var(--line-subtle)] bg-[var(--bg-elev)] px-3 py-2 shadow-inner"
      >
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

      <div className="flex-1 space-y-2 overflow-y-auto">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => handleToggleTask(task.id)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
              task.done
                ? 'bg-[var(--bg-elev)] text-[var(--muted)] line-through'
                : 'bg-[var(--layer-muted)] text-[var(--text)] shadow-inner'
            }`}
          >
            <span>{task.title}</span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                task.done ? 'bg-[var(--line-strong)]' : 'bg-[var(--accent)]'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
