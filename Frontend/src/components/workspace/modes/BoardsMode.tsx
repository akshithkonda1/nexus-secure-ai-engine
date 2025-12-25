import { useState } from 'react';
import { Kanban, Plus } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

export default function BoardsMode() {
  const boards = useWorkspace((state) => state.boards);
  const currentBoardId = useWorkspace((state) => state.currentBoard);
  const addCard = useWorkspace((state) => state.addCard);

  const [newCardTitles, setNewCardTitles] = useState<Record<string, string>>({});

  const currentBoard = boards.find((b) => b.id === currentBoardId) || boards[0];

  const handleAddCard = (columnId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newCardTitles[columnId];
    if (title?.trim() && currentBoard) {
      addCard(currentBoard.id, columnId, title.trim());
      setNewCardTitles({ ...newCardTitles, [columnId]: '' });
    }
  };

  if (!currentBoard) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
        No boards yet.
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {currentBoard.columns.map((column) => (
        <div
          key={column.id}
          className="w-80 shrink-0 rounded-2xl border border-[var(--line-subtle)] bg-[var(--bg-surface)]/50 p-4"
        >
          {/* Column Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Kanban className="h-4 w-4 text-[var(--accent)]" />
              <h3 className="font-semibold text-[var(--text)]">{column.name}</h3>
              <span className="rounded-full bg-[var(--bg-elev)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                {column.cards.length}
              </span>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {column.cards.map((card) => (
              <div
                key={card.id}
                className="rounded-lg border-l-4 border-l-[var(--accent)] bg-[var(--bg-surface)] p-3 shadow-sm transition-shadow hover:shadow-md"
                draggable
              >
                <h4 className="font-medium text-[var(--text)]">{card.title}</h4>
                {card.description && (
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {card.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Add Card Form */}
          <form
            onSubmit={(e) => handleAddCard(column.id, e)}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              value={newCardTitles[column.id] || ''}
              onChange={(e) =>
                setNewCardTitles({ ...newCardTitles, [column.id]: e.target.value })
              }
              placeholder="Add card..."
              className="flex-1 rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newCardTitles[column.id]?.trim()}
              className="rounded-lg bg-[var(--accent)] p-2 text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
