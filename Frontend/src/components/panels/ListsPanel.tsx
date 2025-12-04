import React, { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { WorkspaceList } from "@/types/workspace";

interface ListsPanelProps {
  lists: WorkspaceList[];
  onChange: (next: WorkspaceList[]) => void;
  close?: () => void;
}

const ListsPanel: React.FC<ListsPanelProps> = ({ lists, onChange, close }) => {
  const [newTitle, setNewTitle] = useState("");

  const surfaceClass =
    "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";
  const textSecondary = "text-textSecondary";
  const textMuted = "text-textMuted";

  const addList = () => {
    const title = newTitle.trim();
    if (!title) return;
    const updated = [...lists, { id: crypto.randomUUID(), title, items: [] }];
    onChange(updated);
    setNewTitle("");
  };

  return (
    <div className={`flex h-full flex-col gap-4 ${surfaceClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary">
          <ClipboardList className="h-4 w-4" /> Lists Control Center
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addList()}
            placeholder="New list"
            className="rounded-full border border-neutral-300/50 bg-white/85 px-4 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-neutral-400 focus:outline-none backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85 dark:focus:border-neutral-600"
          />
          <button
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-textPrimary transition hover:bg-emerald-400"
            onClick={addList}
          >
            <Plus className="h-4 w-4" />
          </button>
          {close && (
            <button
              onClick={close}
              className="rounded-full border border-neutral-300/50 px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-neutral-400 dark:border-neutral-700/50 dark:hover:border-neutral-600"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lists.map((list) => (
          <div key={list.id} className={`${surfaceClass} p-4`}>
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary">
              {list.title}
              <span className={`text-xs ${textSecondary}`}>{list.items.length} items</span>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {list.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-xl border border-neutral-300/50 bg-white/85 px-3 py-2 text-textPrimary backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85 ${
                    item.done ? "line-through decoration-textMuted" : ""
                  }`}
                >
                  <span>{item.text}</span>
                  {item.done && <span className="text-[11px] uppercase text-emerald-500">Done</span>}
                </div>
              ))}
              {!list.items.length && <p className={`text-xs ${textMuted}`}>No items yet. Add from the list toolbar.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListsPanel;
