import React, { useState } from "react";
import { useListsStore } from "../../state/listsStore";
import { useModeStore } from "../../state/modeStore";

export const ListsWidget: React.FC = () => {
  const { tasks, addTask, removeTask, toggleTask, glow } = useListsStore();
  const { mode } = useModeStore();
  const [draft, setDraft] = useState("");

  const tilePanel =
    "relative z-[10] overflow-hidden rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-white/10 dark:border-neutral-700/20 p-6 md:p-8 text-neutral-800 dark:text-neutral-200 leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.01]";
  const innerTile =
    "relative overflow-hidden rounded-2xl bg-white/85 dark:bg-neutral-900/85 border border-white/10 dark:border-neutral-700/20 p-5 md:p-6 text-neutral-700 dark:text-neutral-300 leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.15)]";

  return (
    <div
      className={`${tilePanel} ${glow ? "ring-2 ring-emerald-500" : ""} fade-in`}
    >
      <div className="absolute inset-0 pointer-events-none rounded-3xl backdrop-blur-xl" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-300">Lists</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Tasks detected from Pages</p>
        </div>
        <span className="text-xs text-neutral-500 dark:text-neutral-300">{mode === "advanced" ? "Advanced" : "Basic"}</span>
      </div>
      <div className="mt-3 space-y-2">
        {tasks.length === 0 && <p className="text-sm text-neutral-600 dark:text-neutral-300">No tasks yet.</p>}
        {tasks.map((task) => (
          <div key={task.id} className={`${innerTile} flex items-center gap-2`}>
            <div className="absolute inset-0 pointer-events-none rounded-2xl backdrop-blur-xl" />
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="h-4 w-4 rounded border-white/10 dark:border-neutral-700/20 bg-transparent"
            />
            <span className={`relative flex-1 text-sm ${task.completed ? "line-through text-neutral-500 dark:text-neutral-400" : "text-neutral-800 dark:text-neutral-100"}`}>
              {task.title}
            </span>
            {mode === "advanced" && (
              <button
                className="relative text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
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
          className="flex-1 rounded-2xl border border-white/10 dark:border-neutral-700/20 bg-white/85 dark:bg-neutral-900/85 p-5 md:p-6 text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl outline-none transition focus:border-white/20 focus:shadow-[0_4px_24px_rgba(0,0,0,0.18)]"
        />
        <button
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm text-neutral-50 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.01] hover:bg-emerald-500"
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
