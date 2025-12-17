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
    <div className="flex flex-wrap items-stretch justify-center gap-4 rounded-[28px] border border-white/20 bg-white/60 p-4 shadow-[0_18px_60px_rgba(10,24,56,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`group flex min-w-[160px] flex-1 flex-col items-center gap-2 rounded-2xl px-4 py-3 text-sm transition-all ${
              isActive
                ? "border border-white/35 bg-white/85 text-[var(--text-strong)] shadow-inner backdrop-blur-lg dark:border-white/15 dark:bg-white/10"
                : "border border-transparent text-[var(--text-primary)] hover:border-white/20 hover:bg-white/70 hover:backdrop-blur-sm dark:hover:border-white/10 dark:hover:bg-white/10"
            }`}
            aria-pressed={isActive}
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isActive
                ? "bg-[var(--ryuzen-dodger)] text-white shadow-sm"
                : "bg-white/80 text-[var(--text-muted)] ring-1 ring-white/40 shadow-inner dark:bg-white/10 dark:ring-white/10"
            }`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-[13px] font-semibold leading-tight text-[var(--text-strong)]">{item.label}</span>
              <span className={`text-[11px] leading-tight ${isActive ? "text-[var(--text-muted)]" : "text-[var(--text-muted)]"}`}>
                {item.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
