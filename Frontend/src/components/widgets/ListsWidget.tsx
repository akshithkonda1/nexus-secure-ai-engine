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
    <div className="ryuzen-card group relative bg-[var(--bg-widget)] p-4 text-[var(--text-primary)]" onClick={onExpand}>
      <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-[var(--border-card)]" />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          <ClipboardList className="h-4 w-4" /> Lists
        </div>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-900 dark:text-emerald-50">Live</span>
      </div>
      <div className="space-y-3 overflow-y-auto pr-1" onClick={(e) => e.stopPropagation()}>
        {data.map((list) => (
          <div key={list.id} className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-widget)] p-3">
            <div className="flex items-center justify-between text-sm font-medium text-[var(--text-primary)]">
              {list.title}
              <span className="text-xs text-[var(--text-secondary)]">{list.items.length} items</span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-[var(--text-primary)]">
              {list.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-primary)] transition hover:bg-[var(--bg-widget)]"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[var(--border-card)] bg-transparent"
                      checked={!!item.done}
                      onChange={() => toggleItem(list.id, item)}
                    />
                    <span className={item.done ? "line-through text-[var(--text-secondary)]" : ""}>{item.text}</span>
                  </div>
                  <button
                    className="text-[var(--text-secondary)] transition hover:text-red-500"
                    onClick={() => deleteItem(list.id, item.id)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </label>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-[var(--bg-card)] px-2 py-1">
              <input
                value={drafts[list.id] || ""}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [list.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addItem(list.id)}
                placeholder="Add list item"
                className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
              />
              <button
                className="rounded-full bg-[var(--bg-widget)] p-1 text-[var(--text-primary)] transition hover:opacity-80"
                onClick={() => addItem(list.id)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-[var(--bg-card)] p-3 text-xs text-[var(--text-secondary)]">
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
