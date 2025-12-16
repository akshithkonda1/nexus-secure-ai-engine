import { LucideIcon } from "lucide-react";

export type OSBarItem = {
  id: string;
  label: string;
  description: string;
  hotkey?: string;
  icon: LucideIcon;
};

type OSBarProps = {
  items: OSBarItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function OSBar({ items, activeId, onSelect }: OSBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] p-2">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`group flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all ${
              isActive
                ? "bg-gradient-to-r from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] text-white shadow-md"
                : "text-[var(--text-primary)] hover:bg-[var(--layer-muted)]"
            }`}
            aria-pressed={isActive}
          >
            <item.icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[var(--text-muted)]"}`} />
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight">{item.label}</span>
              <span className={`text-[11px] leading-tight ${isActive ? "text-white/80" : "text-[var(--text-muted)]"}`}>
                {item.description}
              </span>
            </div>
            {item.hotkey && (
              <span
                className={`ml-auto rounded-md border px-1.5 py-0.5 text-[10px] ${
                  isActive
                    ? "border-white/40 bg-white/10 text-white"
                    : "border-[var(--line-subtle)] text-[var(--text-muted)]"
                }`}
              >
                {item.hotkey}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
