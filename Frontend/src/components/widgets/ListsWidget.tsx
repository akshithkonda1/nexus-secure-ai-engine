import React, { useMemo, useState } from "react";
import { ClipboardList, Plus, X } from "lucide-react";
import { WorkspaceList, WorkspaceListItem } from "@/types/workspace";

interface ListsWidgetProps {
  data: WorkspaceList[];
  onChange: (lists: WorkspaceList[]) => void;
  onExpand: () => void;
}

const ListsWidget: React.FC<ListsWidgetProps> = ({ data, onChange, onExpand }) => {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const addItem = (listId: string) => {
    const text = drafts[listId]?.trim();
    if (!text) return;
    const updated = data.map((list) =>
      list.id === listId
        ? { ...list, items: [...list.items, { id: crypto.randomUUID(), text }] }
        : list,
    );
    onChange(updated);
    setDrafts((prev) => ({ ...prev, [listId]: "" }));
    window.dispatchEvent(new CustomEvent("toron-signal", { detail: { lists: updated } }));
  };

  const toggleItem = (listId: string, item: WorkspaceListItem) => {
    const updated = data.map((list) =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)),
          }
        : list,
    );
    onChange(updated);
  };

  const deleteItem = (listId: string, itemId: string) => {
    const updated = data.map((list) =>
      list.id === listId ? { ...list, items: list.items.filter((item) => item.id !== itemId) } : list,
    );
    onChange(updated);
  };

  const previewItems = useMemo(() => data.flatMap((list) => list.items).slice(0, 4), [data]);

  return (
    <div
      className="group relative rounded-[32px] border border-white/10 bg-white/10 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl transition hover:scale-[1.02] hover:border-white/20"
      onClick={onExpand}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-white/10" />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60">
          <ClipboardList className="h-4 w-4" /> Lists
        </div>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-100">Live</span>
      </div>
      <div className="space-y-3 overflow-y-auto pr-1" onClick={(e) => e.stopPropagation()}>
        {data.map((list) => (
          <div key={list.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-sm font-medium text-white/90">
              {list.title}
              <span className="text-xs text-white/60">{list.items.length} items</span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-white/80">
              {list.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 px-2 py-1 text-xs text-white/80"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-black/30"
                      checked={!!item.done}
                      onChange={() => toggleItem(list.id, item)}
                    />
                    <span className={item.done ? "line-through text-white/50" : ""}>{item.text}</span>
                  </div>
                  <button
                    className="text-white/40 transition hover:text-red-300"
                    onClick={() => deleteItem(list.id, item.id)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </label>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-black/30 px-2 py-1">
              <input
                value={drafts[list.id] || ""}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [list.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addItem(list.id)}
                placeholder="Add list item"
                className="w-full bg-transparent text-xs text-white/80 placeholder:text-white/40 focus:outline-none"
              />
              <button
                className="rounded-full bg-white/10 p-1 text-white/80 transition hover:bg-white/20"
                onClick={() => addItem(list.id)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 p-3 text-xs text-white/70">
        {previewItems.length ? (
          <div className="space-y-1">
            {previewItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>Start capturing signals.</p>
        )}
      </div>
    </div>
  );
};

export default ListsWidget;
