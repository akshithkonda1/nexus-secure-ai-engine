import React, { useEffect, useMemo, useState } from "react";
import TaskModal from "./TaskModal";
import { TasksStore } from "./TasksStore";
import { getPriorityColor } from "../../utils/colors";

const views = ["today", "upcoming", "completed"];

const TasksWidget = () => {
  const [tasks, setTasks] = useState(TasksStore.getAll().tasks);
  const [view, setView] = useState("today");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    setTasks(TasksStore.getAll().tasks);
  }, []);

  const filteredTasks = useMemo(() => {
    if (view === "completed") return tasks.filter((task) => task.completed);
    if (view === "upcoming") return tasks.filter((task) => !task.completed && task.time);
    return tasks.filter((task) => !task.completed);
  }, [tasks, view]);

  const handleSave = (payload) => {
    if (payload.id) {
      TasksStore.updateTask(payload.id, payload);
    } else {
      TasksStore.addTask(payload);
    }
    setTasks(TasksStore.getAll().tasks);
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleToggle = (id) => {
    TasksStore.toggleComplete(id);
    setTasks(TasksStore.getAll().tasks);
  };

  const handleReorder = (currentIndex, direction) => {
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= tasks.length) return;
    TasksStore.reorderTasks(currentIndex, nextIndex);
    setTasks(TasksStore.getAll().tasks);
  };

  const handleGenerate = () => {
    TasksStore.generateFromCalendar();
    setTasks(TasksStore.getAll().tasks);
  };

  const handleOptimize = () => {
    const optimized = TasksStore.optimizeTasks(tasks);
    setTasks(optimized);
  };

  return (
    <div className="ryuzen-card flex h-full w-full flex-col rounded-3xl border border-[var(--border-card)] bg-[var(--bg-widget)] p-4 text-[var(--text-primary)] shadow-xl backdrop-blur-[var(--glass-blur)]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Tasks Widget</p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Daily planner</h2>
          <p className="text-sm text-[var(--text-secondary)]">Drag to reorder, tap to complete</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] p-1">
            {views.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  view === v ? "bg-[var(--btn-bg)] text-[var(--btn-text)]" : "text-[var(--text-secondary)] hover:bg-white/10"
                }`}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setModalOpen(true);
            }}
            className="rounded-xl bg-[var(--btn-bg)] px-3 py-2 text-sm font-semibold text-[var(--btn-text)] shadow"
          >
            + Task
          </button>
          <button
            onClick={handleGenerate}
            className="rounded-xl border border-[var(--border-card)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
          >
            From Calendar
          </button>
          <button
            onClick={handleOptimize}
            className="rounded-xl border border-[var(--border-card)] px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
          >
            Optimize
          </button>
        </div>
      </div>

      <div className="scrollbar-thin scrollbar-thumb-white/20 flex-1 space-y-2 overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-card)] bg-[var(--bg-card)] p-6 text-center text-[var(--text-secondary)]">
            No tasks yet. Create one to structure your day.
          </div>
        ) : null}
        {filteredTasks.map((task, index) => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-3"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task.id)}
              className="h-4 w-4 rounded border-[var(--border-card)] accent-[var(--btn-bg)]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: getPriorityColor(task.priority || "none") }}
                />
                <p className={`text-sm font-semibold ${task.completed ? "line-through text-[var(--text-secondary)]" : "text-[var(--text-primary)]"}`}>
                  {task.text}
                </p>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">{task.time || "Anytime"}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-secondary)]">{task.categoryTag}</p>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleReorder(index, -1)}
                className="rounded-lg border border-[var(--border-card)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-white/10"
              >
                ↑
              </button>
              <button
                onClick={() => handleReorder(index, 1)}
                className="rounded-lg border border-[var(--border-card)] px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-white/10"
              >
                ↓
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  setEditingTask(task);
                  setModalOpen(true);
                }}
                className="rounded-lg border border-[var(--border-card)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-white/10"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default TasksWidget;
