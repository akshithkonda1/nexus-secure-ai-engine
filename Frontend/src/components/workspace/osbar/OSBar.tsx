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
    <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-white/12 bg-white/50 p-2 shadow-[0_16px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`group flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all ${
              isActive
                ? "border border-white/30 bg-white/80 text-[var(--text-strong)] shadow-inner backdrop-blur-lg dark:border-white/15 dark:bg-white/10"
                : "border border-transparent text-[var(--text-primary)] hover:border-white/15 hover:bg-white/60 hover:backdrop-blur-sm dark:hover:border-white/10 dark:hover:bg-white/10"
            }`}
            aria-pressed={isActive}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              isActive
                ? "bg-[var(--ryuzen-dodger)] text-white shadow-sm"
                : "bg-white/70 text-[var(--text-muted)] ring-1 ring-white/40 shadow-inner dark:bg-white/10 dark:ring-white/10"
            }`}> 
              <item.icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-[var(--text-strong)]">{item.label}</span>
              <span className={`text-[11px] leading-tight ${isActive ? "text-[var(--text-muted)]" : "text-[var(--text-muted)]"}`}>
                {item.description}
              </span>
            </div>
            {item.hotkey && (
              <span
                className={`ml-auto rounded-full border px-2 py-1 text-[10px] font-semibold ${
                  isActive
                    ? "border-white/40 bg-white/70 text-[var(--text-strong)] shadow-sm"
                    : "border-white/25 text-[var(--text-muted)]"
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
