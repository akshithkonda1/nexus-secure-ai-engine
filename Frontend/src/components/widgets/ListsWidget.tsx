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
      className="group relative rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-4 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl transition hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      onClick={onExpand}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-black/10 dark:ring-white/10" />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">
          <ClipboardList className="h-4 w-4" /> Lists
        </div>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-800 dark:text-emerald-100">Live</span>
      </div>
      <div className="space-y-3 overflow-y-auto pr-1" onClick={(e) => e.stopPropagation()}>
        {data.map((list) => (
          <div key={list.id} className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-3 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
            <div className="flex items-center justify-between text-sm font-medium text-black dark:text-white">
              {list.title}
              <span className="text-xs text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">{list.items.length} items</span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-[var(--text)] dark:text-[var(--text)]">
              {list.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-2 py-1 text-xs text-[var(--text)] transition hover:bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)] dark:text-[var(--text)] dark:hover:bg-[var(--glass)]"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[color-mix(in_oklab,var(--border)_120%,transparent)] bg-white dark:border-white/30 dark:bg-black"
                      checked={!!item.done}
                      onChange={() => toggleItem(list.id, item)}
                    />
                    <span className={item.done ? "line-through text-black/50 dark:text-white/50" : ""}>{item.text}</span>
                  </div>
                  <button
                    className="text-black/50 transition hover:text-red-500 dark:text-white/50 dark:hover:text-red-300"
                    onClick={() => deleteItem(list.id, item.id)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </label>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-2 py-1 dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
              <input
                value={drafts[list.id] || ""}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [list.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addItem(list.id)}
                placeholder="Add list item"
                className="w-full bg-transparent text-xs text-[var(--text)] placeholder:text-black/50 focus:outline-none dark:text-[var(--text)] dark:placeholder:text-white/50"
              />
              <button
                className="rounded-full bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] p-1 text-[var(--text)] transition hover:bg-black/20 dark:bg-[var(--glass)] dark:text-[var(--text)] dark:hover:bg-[color-mix(in_oklab,var(--glass)_85%,transparent)]"
                onClick={() => addItem(list.id)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-gradient-to-r from-black/10 to-black/5 p-3 text-xs text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:from-white/10 dark:to-white/5 dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
        {previewItems.length ? (
          <div className="space-y-1">
            {previewItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
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
