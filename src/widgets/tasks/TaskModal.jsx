import React, { useEffect, useState } from "react";

const TaskModal = ({ open, task, onClose, onSave }) => {
  const [text, setText] = useState(task?.text || "");
  const [time, setTime] = useState(task?.time || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [categoryTag, setCategoryTag] = useState(task?.categoryTag || "personal");

  useEffect(() => {
    setText(task?.text || "");
    setTime(task?.time || "");
    setPriority(task?.priority || "medium");
    setCategoryTag(task?.categoryTag || "personal");
  }, [task, open]);

  if (!open) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    onSave({ ...task, text, time, priority, categoryTag });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-[var(--glass-blur)]">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Task</p>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">{task ? "Edit task" : "Create task"}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-[var(--border-card)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Task description"
            className="w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Time (optional)"
              className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="none">None</option>
            </select>
          </div>
          <input
            value={categoryTag}
            onChange={(e) => setCategoryTag(e.target.value)}
            placeholder="Category tag"
            className="w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] px-3 py-2 text-[var(--text-primary)] focus:outline-none"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--border-card)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-[var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[var(--btn-text)] shadow"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
