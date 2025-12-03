import React, { useState } from "react";
import { useListsStore } from "../../state/listsStore";
import { useModeStore } from "../../state/modeStore";

export const ListsWidget: React.FC = () => {
  const { tasks, addTask, removeTask, toggleTask, glow } = useListsStore();
  const { mode } = useModeStore();
  const [draft, setDraft] = useState("");

  const tilePanel =
    "relative rounded-3xl bg-tile bg-tileGradient border border-tileBorder shadow-tile px-6 py-5 before:absolute before:inset-0 before:rounded-3xl before:bg-tileInner before:content-[''] before:pointer-events-none transition-all duration-300 hover:shadow-tileStrong hover:border-tileBorderStrong";
  const innerTile = "rounded-xl bg-tileStrong border border-tileBorder px-4 py-3 shadow-tile";

  return (
    <div
      className={`${tilePanel} ${glow ? "ring-2 ring-emerald-500" : ""} fade-in`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">Lists</p>
          <p className="text-sm text-textMuted">Tasks detected from Pages</p>
        </div>
        <span className="text-xs text-textSecondary">{mode === "advanced" ? "Advanced" : "Basic"}</span>
      </div>
      <div className="mt-3 space-y-2">
        {tasks.length === 0 && <p className="text-sm text-textSecondary">No tasks yet.</p>}
        {tasks.map((task) => (
          <div key={task.id} className={`${innerTile} flex items-center gap-2`}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="h-4 w-4 rounded border-tileBorder bg-transparent"
            />
            <span className={`flex-1 text-sm ${task.completed ? "line-through text-textSecondary" : "text-textPrimary"}`}>
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
          className="flex-1 rounded-xl bg-tileStrong border border-tileBorder px-4 py-3 text-sm text-textPrimary shadow-tile outline-none focus:border-tileBorderStrong focus:shadow-tileStrong"
        />
        <button
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm text-textPrimary shadow-tile transition hover:bg-emerald-500"
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
