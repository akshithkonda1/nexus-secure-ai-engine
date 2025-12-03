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

  const panelShell =
    "relative bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-3xl px-6 py-5 transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-glassInner before:blur-xl before:pointer-events-none hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong hover:scale-[1.01]";
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
    <div className={`flex h-full flex-col gap-4 ${panelShell}`}>
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
            className="rounded-full border border-glassBorder bg-glass px-4 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:border-glassBorderStrong focus:outline-none"
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
              className="rounded-full border border-glassBorder px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-glassBorderStrong"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lists.map((list) => (
          <div key={list.id} className={`${panelShell} p-4 shadow-none`}>
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary">
              {list.title}
              <span className={`text-xs ${textSecondary}`}>{list.items.length} items</span>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {list.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-xl border border-glassBorder bg-glass px-3 py-2 text-textPrimary ${
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
