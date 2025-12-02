import React, { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";
import { WorkspaceList } from "@/types/workspace";

interface ListsPanelProps {
  lists: WorkspaceList[];
  onChange: (next: WorkspaceList[]) => void;
}

const ListsPanel: React.FC<ListsPanelProps> = ({ lists, onChange }) => {
  const [newTitle, setNewTitle] = useState("");

  const addList = () => {
    const title = newTitle.trim();
    if (!title) return;
    const updated = [...lists, { id: crypto.randomUUID(), title, items: [] }];
    onChange(updated);
    setNewTitle("");
  };

  return (
    <div className="relative rounded-[32px] border border-black/10 bg-black/5 p-6 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
          <ClipboardList className="h-4 w-4" /> Lists Panel
        </div>
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addList()}
            placeholder="New list"
            className="rounded-full border border-black/10 bg-black/5 px-4 py-2 text-sm text-black placeholder:text-black/50 focus:outline-none dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-white/60"
          />
          <button
            className="rounded-full bg-black/10 px-3 py-2 text-sm text-black transition hover:bg-black/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            onClick={addList}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lists.map((list) => (
          <div key={list.id} className="rounded-2xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between text-sm font-semibold text-black dark:text-white">
              {list.title}
              <span className="text-xs text-black/60 dark:text-white/60">{list.items.length} items</span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-black/80 dark:text-white/80">
              {list.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-black/5 px-3 py-2 dark:bg-white/5">
                  <span>{item.text}</span>
                  {item.done && <span className="text-[11px] uppercase text-emerald-600 dark:text-emerald-200">done</span>}
                </div>
              ))}
              {!list.items.length && <p className="text-xs text-black/60 dark:text-white/60">No items yet.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListsPanel;
