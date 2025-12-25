/**
 * Lists Content Component
 * Pure content for Lists window (no shell)
 */

import { useState, FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

type ListsContentProps = {
  className?: string;
};

export default function ListsContent({ className }: ListsContentProps) {
  const lists = useWorkspace(state => state.lists);
  const addList = useWorkspace(state => state.addList);
  const addListItem = useWorkspace(state => state.addListItem);
  const toggleListItem = useWorkspace(state => state.toggleListItem);
  const deleteListItem = useWorkspace(state => state.deleteListItem);

  const [selectedListId, setSelectedListId] = useState(lists[0]?.id || '');
  const [newItemText, setNewItemText] = useState('');
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  const selectedList = lists.find((l) => l.id === selectedListId);

  const handleAddItem = (e: FormEvent) => {
    e.preventDefault();
    if (newItemText.trim() && selectedListId) {
      addListItem(selectedListId, newItemText.trim());
      setNewItemText('');
    }
  };

  const handleAddList = (e: FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      addList(newListName.trim());
      setNewListName('');
      setIsAddingList(false);
    }
  };

  return (
    <div className={`flex h-full flex-col gap-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Semantic shelves</p>
        <button
          type="button"
          onClick={() => setIsAddingList(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line-subtle)]/60 bg-[var(--bg-elev)] text-[var(--text)] shadow-inner transition hover:border-[var(--line-strong)]/80"
          aria-label="Add list"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {isAddingList && (
        <form onSubmit={handleAddList} className="flex gap-2">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="New list name..."
            autoFocus
            className="flex-1 rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm text-white hover:brightness-110"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAddingList(false)}
            className="rounded-lg bg-[var(--bg-elev)] px-4 py-2 text-sm text-[var(--text)]"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {lists.map((list) => (
          <button
            key={list.id}
            type="button"
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
              selectedListId === list.id
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-elev)]/80 text-[var(--text-muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]'
            }`}
            onClick={() => setSelectedListId(list.id)}
          >
            {list.name}
            <span className="ml-2 opacity-60">({list.items.length})</span>
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {selectedList?.items.map((item) => (
          <div
            key={item.id}
            className="group flex items-start gap-3 rounded-xl bg-[var(--layer-muted)]/80 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleListItem(selectedListId!, item.id)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded cursor-pointer accent-[var(--accent)]"
            />
            <span className={`flex-1 text-sm ${item.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>
              {item.text}
            </span>
            <button
              onClick={() => deleteListItem(selectedListId!, item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {selectedList?.items.length === 0 && (
          <div className="py-8 text-center text-sm text-[var(--text-muted)]">
            No items yet. Add one below!
          </div>
        )}
      </div>

      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add item..."
          className="flex-1 rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={!newItemText.trim()}
          className="rounded-lg bg-[var(--accent)] p-2 text-white disabled:opacity-50 hover:brightness-110"
        >
          <Plus className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
