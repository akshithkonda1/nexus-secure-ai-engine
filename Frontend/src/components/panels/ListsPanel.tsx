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

  const addList = () => {
    const title = newTitle.trim();
    if (!title) return;
    const updated = [...lists, { id: crypto.randomUUID(), title, items: [] }];
    onChange(updated);
    setNewTitle("");
  };

  return (
    <div className="relative rounded-[32px] border border-[var(--border)] bg-[var(--glass)] p-6 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
          <ClipboardList className="h-4 w-4" /> Lists Panel
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addList()}
            placeholder="New list"
            className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-4 py-2 text-sm text-[var(--text)] placeholder:text-[color-mix(in_oklab,var(--text)_60%,transparent)] focus:outline-none"
          />
          <button
            className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_75%,transparent)] px-3 py-2 text-sm text-[var(--text)] transition hover:bg-[color-mix(in_oklab,var(--glass)_90%,transparent)]"
            onClick={addList}
          >
            <Plus className="h-4 w-4" />
          </button>
          {close && (
            <button
              onClick={close}
              className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-2 text-xs uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_70%,transparent)] hover:bg-[color-mix(in_oklab,var(--glass)_80%,transparent)]"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lists.map((list) => (
          <div key={list.id} className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--text)]">
              {list.title}
              <span className="text-xs text-[color-mix(in_oklab,var(--text)_65%,transparent)]">{list.items.length} items</span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-[var(--text)]">
              {list.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-[color-mix(in_oklab,var(--glass)_50%,transparent)] px-3 py-2">
                  <span>{item.text}</span>
                  {item.done && <span className="text-[11px] uppercase text-emerald-600 dark:text-emerald-200">done</span>}
                </div>
              ))}
              {!list.items.length && <p className="text-xs text-[color-mix(in_oklab,var(--text)_60%,transparent)]">No items yet.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListsPanel;
