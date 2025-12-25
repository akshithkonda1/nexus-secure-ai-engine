/**
 * Lists Content Component
 * Pure content for Lists window (no shell)
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

type ListsContentProps = {
  className?: string;
};

export default function ListsContent({ className }: ListsContentProps) {
  const lists = useWorkspace(state => state.lists);
  const addList = useWorkspace(state => state.addList);
  const [selected, setSelected] = useState(lists[0]?.id);

  const handleAddList = () => {
    const name = prompt('Enter list name:');
    if (name) {
      addList(name);
    }
  };

  return (
    <div className={`flex h-full flex-col gap-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Semantic shelves</p>
        <button
          type="button"
          onClick={handleAddList}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line-subtle)]/60 bg-[var(--bg-elev)] text-[var(--text)] shadow-inner transition hover:border-[var(--line-strong)]/80"
          aria-label="Add list"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {lists.map((list) => (
          <button
            key={list.id}
            type="button"
            className={`flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left text-sm transition ${
              selected === list.id
                ? 'bg-[var(--bg-elev)]/80 text-[var(--text)] shadow-inner ring-1 ring-[var(--line-subtle)]/60'
                : 'text-[var(--muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]'
            }`}
            onClick={() => setSelected(list.id)}
          >
            <span className="font-medium">{list.name}</span>
            <span className="rounded-full bg-[var(--layer-muted)] px-2 py-1 text-xs text-[var(--text-muted)]">
              {list.items.length}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <footer className="text-xs text-[var(--text-muted)]">
          Selected: {lists.find(l => l.id === selected)?.name}
        </footer>
      )}
    </div>
  );
}
