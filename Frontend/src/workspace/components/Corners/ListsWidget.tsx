import React, { useState } from "react";
import { useListsStore } from "../../state/listsStore";
import { useModeStore } from "../../state/modeStore";

export const ListsWidget: React.FC = () => {
  const { tasks, addTask, removeTask, toggleTask, glow } = useListsStore();
  const { mode } = useModeStore();
  const [draft, setDraft] = useState("");

  return (
    <div
      className={`rounded-2xl border border-borderStrong bg-bgElevated/70 p-4 shadow-lg transition ${
        glow ? "ring-2 ring-emerald-500" : ""
      } fade-in`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textMuted">Lists</p>
          <p className="text-sm text-textMuted">Tasks detected from Pages</p>
        </div>
        <span className="text-xs text-textSecondary">{mode === "advanced" ? "Advanced" : "Basic"}</span>
      </div>
      <div className="mt-3 space-y-2">
        {tasks.length === 0 && <p className="text-sm text-textSecondary">No tasks yet.</p>}
        {tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="h-4 w-4 rounded border-borderStrong bg-bgElevated"
            />
            <span className={`flex-1 text-sm ${task.completed ? "line-through text-textSecondary" : "text-textMuted"}`}>
              {task.title}
            </span>
            {mode === "advanced" && (
              <button
                className="text-xs text-textSecondary hover:text-textMuted"
                onClick={() => removeTask(task.id)}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add task"
          className="flex-1 rounded-lg bg-bgElevated px-3 py-2 text-sm text-textMuted outline-none ring-1 ring-transparent focus:ring-emerald-500"
        />
        <button
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-textPrimary transition hover:bg-emerald-500"
          onClick={() => {
            if (!draft.trim()) return;
            addTask(draft.trim());
            setDraft("");
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
};
