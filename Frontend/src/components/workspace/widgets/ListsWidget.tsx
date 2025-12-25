import { useState } from "react";
import { ListChecks, Plus, X } from "lucide-react";
import { useWorkspaceStore } from "../../../stores/workspaceStore";

export interface ListsWidgetProps {
  className?: string;
}

export default function ListsWidget({ className = "" }: ListsWidgetProps) {
  // Zustand selectors
  const lists = useWorkspaceStore((state) => state.lists);
  const addListItem = useWorkspaceStore((state) => state.addListItem);
  const toggleListItem = useWorkspaceStore((state) => state.toggleListItem);
  const removeListItem = useWorkspaceStore((state) => state.removeListItem);

  // Local state
  const [selectedListId, setSelectedListId] = useState(lists[0]?.id || '1');
  const [newItemText, setNewItemText] = useState("");

  // Derived state
  const selectedList = lists.find((l) => l.id === selectedListId);

  // Handlers
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemText.trim() && selectedListId) {
      addListItem(selectedListId, newItemText.trim());
      setNewItemText("");
    }
  };

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Lists</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Semantic shelves</span>
      </header>

      {/* List selector tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setSelectedListId(list.id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedListId === list.id
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-elev)]/50 text-[var(--text-muted)] hover:bg-[var(--bg-elev)]"
            }`}
          >
            {list.name}
            <span className="ml-1.5 opacity-60">({list.items.length})</span>
          </button>
        ))}
      </div>

      {/* List items */}
      <div className="space-y-2">
        {selectedList && selectedList.items.length > 0 ? (
          selectedList.items.map((item) => (
            <div
              key={item.id}
              className="group flex items-start gap-2 rounded-lg bg-[var(--bg-elev)]/40 p-2 transition-colors hover:bg-[var(--bg-elev)]/60"
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleListItem(selectedListId, item.id)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[var(--line-subtle)] bg-[var(--bg-surface)] text-[var(--accent)]"
              />
              <span
                className={`flex-1 text-sm ${
                  item.done
                    ? "text-[var(--text-muted)] line-through"
                    : "text-[var(--text)]"
                }`}
              >
                {item.text}
              </span>
              <button
                onClick={() => removeListItem(selectedListId, item.id)}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                type="button"
              >
                <X className="h-3.5 w-3.5 text-[var(--text-muted)] hover:text-[var(--text)]" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No items yet. Add one below!
          </div>
        )}
      </div>

      {/* Add new item form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add item..."
          className="flex-1 rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-surface)]/50 px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        <button
          type="submit"
          disabled={!newItemText.trim()}
          className="shrink-0 rounded-lg bg-[var(--accent)] p-2 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
