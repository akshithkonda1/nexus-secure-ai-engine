import { useState } from "react";
import { ListChecks, Circle } from "lucide-react";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { useWindowManager } from "../../../hooks/useWindowManager";

export interface ListsWidgetProps {
  className?: string;
}

export default function ListsWidget({ className = "" }: ListsWidgetProps) {
  const lists = useWorkspace((state) => state.lists);
  const toggleListItem = useWorkspace((state) => state.toggleListItem);
  const openWindow = useWindowManager((state) => state.openWindow);

  const [selectedListIndex, setSelectedListIndex] = useState(0);
  const selectedList = lists[selectedListIndex];

  const handleHeaderClick = () => {
    openWindow('lists');
  };

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      <header
        className="flex items-center justify-between cursor-pointer hover:bg-[var(--bg-elev)]/20 -mx-2 -mt-2 px-2 pt-2 pb-1 rounded-t-xl transition-colors"
        onClick={handleHeaderClick}
        title="Click to expand"
      >
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Lists</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Semantic shelves</span>
      </header>

      <div className="flex gap-2 overflow-x-auto">
        {lists.map((list, index) => (
          <button
            key={list.id}
            onClick={() => setSelectedListIndex(index)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              index === selectedListIndex
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--bg-elev)]/50 text-[var(--text-muted)] hover:bg-[var(--bg-elev)]"
            }`}
          >
            {list.name}
            <span className="ml-1.5 opacity-60">({list.items.length})</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {selectedList && selectedList.items.length > 0 ? (
          selectedList.items.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => toggleListItem(selectedList.id, item.id)}
              className="group flex w-full items-start gap-2 rounded-lg bg-[var(--bg-elev)]/40 p-2 transition-colors hover:bg-[var(--bg-elev)]/60 text-left"
            >
              <Circle
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  item.done ? "fill-current text-[var(--accent)]" : "text-[var(--text-muted)]"
                }`}
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
            </button>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No items yet
          </div>
        )}
      </div>
    </section>
  );
}
