import { ListChecks, Circle } from "lucide-react";

export interface ListsWidgetProps {
  className?: string;
}

const sampleLists = [
  {
    id: '1',
    name: 'Shopping',
    items: [
      { id: '1', text: 'Buy groceries', done: false },
      { id: '2', text: 'Pick up package', done: true },
    ],
  },
  {
    id: '2',
    name: 'Reading',
    items: [
      { id: '3', text: 'Finish chapter 5', done: false },
      { id: '4', text: 'Take notes', done: false },
    ],
  },
];

export default function ListsWidget({ className = "" }: ListsWidgetProps) {
  const selectedList = sampleLists[0];

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Lists</h2>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Semantic shelves</span>
      </header>

      <div className="flex gap-2 overflow-x-auto">
        {sampleLists.map((list, index) => (
          <button
            key={list.id}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              index === 0
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
          selectedList.items.map((item) => (
            <div
              key={item.id}
              className="group flex items-start gap-2 rounded-lg bg-[var(--bg-elev)]/40 p-2 transition-colors hover:bg-[var(--bg-elev)]/60"
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
            </div>
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
