import { useState } from "react";
import { ListChecks, Plus } from "lucide-react";

const lists = [
  { name: "Research", count: 12 },
  { name: "Delivery", count: 8 },
  { name: "Backlog", count: 19 },
];

type ListsWidgetProps = {
  className?: string;
};

export default function ListsWidget({ className }: ListsWidgetProps) {
  const [selected, setSelected] = useState(lists[0].name);

  return (
    <section
      aria-label="Lists widget"
      className={`relative flex min-w-[clamp(260px,22vw,360px)] flex-col gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-surface)]/90 p-4 text-[var(--text)] shadow-[var(--shadow-soft)] backdrop-blur-lg ${className ?? ""}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-muted)] text-[var(--accent)] ring-1 ring-[var(--line-subtle)]">
            <ListChecks className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Lists</p>
            <p className="text-xs text-[var(--text-muted)]">Semantic shelves</p>
          </div>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--line-subtle)] bg-[var(--bg-elev)] text-[var(--text)] shadow-inner transition hover:border-[var(--line-strong)]"
          aria-label="Add list"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>
      <div className="space-y-2">
        {lists.map((list) => (
          <button
            key={list.name}
            type="button"
            className={`flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-2 text-left text-sm transition ${
              selected === list.name
                ? "bg-[var(--bg-elev)] text-[var(--text)] shadow-inner ring-1 ring-[var(--line-subtle)]"
                : "text-[var(--muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
            }`}
            onClick={() => setSelected(list.name)}
          >
            <span className="font-medium">{list.name}</span>
            <span className="rounded-full bg-[var(--layer-muted)] px-2 py-1 text-xs text-[var(--text-muted)]">{list.count}</span>
          </button>
        ))}
      </div>
      <footer className="text-xs text-[var(--text-muted)]">Selected list: {selected}</footer>
    </section>
  );
}
