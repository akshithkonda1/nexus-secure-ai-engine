import React, { useState } from "react";

type Task = {
  id: string;
  title: string;
  time: string;
  tags: string[];
  syncStatus: "Synced" | "Pending" | "Syncing";
};

const defaultTasks: Task[] = [
  {
    id: "task-1",
    title: "Review integrations",
    time: "Today 4:30 PM",
    tags: ["connectors"],
    syncStatus: "Synced",
  },
  {
    id: "task-2",
    title: "Draft architecture notes",
    time: "Tomorrow 11:00 AM",
    tags: ["architecture"],
    syncStatus: "Pending",
  },
  {
    id: "task-3",
    title: "Sync with design team",
    time: "Friday 2:00 PM",
    tags: ["design"],
    syncStatus: "Syncing",
  },
];

const TasksPanel: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [newTask, setNewTask] = useState({ title: "", time: "", tags: "", syncStatus: "Pending" as Task["syncStatus"] });

  const controlClass =
    "w-full rounded-xl border border-neutral-300/50 dark:border-neutral-700/50 px-3 py-2 leading-relaxed bg-white/85 dark:bg-neutral-900/85 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl";
  const actionButtonClass =
    "rounded-full px-4 py-2 leading-relaxed bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl";
  const compactActionButtonClass =
    "rounded-full px-3 py-1 text-sm leading-relaxed bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl";
  const pillClass = "rounded-full border border-neutral-300/50 dark:border-neutral-700/50 px-3 py-1 text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-xl";

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks((current) => [
      ...current,
      {
        id: `task-${Date.now()}`,
        title: newTask.title.trim(),
        time: newTask.time.trim() || "No time set",
        tags: newTask.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        syncStatus: newTask.syncStatus,
      },
    ]);
    setNewTask({ title: "", time: "", tags: "", syncStatus: "Pending" });
  };

  const updateTask = (id: string, payload: Partial<Task> & { tags?: string }) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              ...payload,
              tags: payload.tags !== undefined ? payload.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : task.tags,
            }
          : task
      )
    );
  };

  const deleteTask = (id: string) => setTasks((current) => current.filter((task) => task.id !== id));

  const reorderTask = (id: string, direction: -1 | 1) => {
    setTasks((current) => {
      const index = current.findIndex((task) => task.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  return (
    <div className="space-y-4 leading-relaxed text-neutral-800 dark:text-neutral-200">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Tasks</h2>
          <p>Add, edit, delete, and reorder tasks with tags and sync states.</p>
        </div>
        <div className="grid gap-2 md:grid-cols-4">
          <input
            value={newTask.title}
            onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
            className={controlClass}
            placeholder="Task title"
          />
          <input
            value={newTask.time}
            onChange={(e) => setNewTask((prev) => ({ ...prev, time: e.target.value }))}
            className={controlClass}
            placeholder="When"
          />
          <input
            value={newTask.tags}
            onChange={(e) => setNewTask((prev) => ({ ...prev, tags: e.target.value }))}
            className={controlClass}
            placeholder="Tags"
          />
          <select
            value={newTask.syncStatus}
            onChange={(e) => setNewTask((prev) => ({ ...prev, syncStatus: e.target.value as Task["syncStatus"] }))}
            className={controlClass}
          >
            <option value="Synced">Synced</option>
            <option value="Pending">Pending</option>
            <option value="Syncing">Syncing</option>
          </select>
        </div>
        <button
          type="button"
          className={actionButtonClass}
          onClick={addTask}
        >
          Add task
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="
              relative rounded-3xl
              bg-white/85 dark:bg-neutral-900/85
              border border-neutral-300/50 dark:border-neutral-700/50
              text-neutral-800 dark:text-neutral-200
              shadow-[0_4px_20px_rgba(0,0,0,0.10)]
              backdrop-blur-xl
              p-6 md:p-8 z-[10]
            "
          >
            <div className="absolute inset-0 pointer-events-none rounded-3xl backdrop-blur-xl" />
            <div className="grid gap-3 md:grid-cols-4 md:items-center">
              <input
                value={task.title}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                className={controlClass}
              />
              <input
                value={task.time}
                onChange={(e) => updateTask(task.id, { time: e.target.value })}
                className={controlClass}
              />
              <input
                value={task.tags.join(", ")}
                onChange={(e) => updateTask(task.id, { tags: e.target.value })}
                className={controlClass}
              />
              <select
                value={task.syncStatus}
                onChange={(e) => updateTask(task.id, { syncStatus: e.target.value as Task["syncStatus"] })}
                className={controlClass}
              >
                <option value="Synced">Synced</option>
                <option value="Pending">Pending</option>
                <option value="Syncing">Syncing</option>
              </select>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className={pillClass}>
                {task.tags.length ? task.tags.join(", ") : "No tags"}
              </span>
              <span className={pillClass}>
                {task.time}
              </span>
              <span className={pillClass}>
                {task.syncStatus}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={compactActionButtonClass}
                onClick={() => reorderTask(task.id, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                className={compactActionButtonClass}
                onClick={() => reorderTask(task.id, 1)}
              >
                Move down
              </button>
              <button
                type="button"
                className={compactActionButtonClass}
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
              <span className="ml-auto text-xs">Task {index + 1} of {tasks.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPanel;
