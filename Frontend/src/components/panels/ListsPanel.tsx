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
    <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
          <ClipboardList className="h-4 w-4" /> Lists Panel
        </div>
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addList()}
            placeholder="New list"
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none"
          />
          <button
            className="rounded-full bg-white/15 px-3 py-2 text-sm text-white transition hover:bg-white/25"
            onClick={addList}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {lists.map((list) => (
          <div key={list.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-white/90">
              {list.title}
              <span className="text-xs text-white/60">{list.items.length} items</span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-white/80">
              {list.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2">
                  <span>{item.text}</span>
                  {item.done && <span className="text-[11px] uppercase text-emerald-200">done</span>}
                </div>
              ))}
              {!list.items.length && <p className="text-xs text-white/50">No items yet.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListsPanel;
