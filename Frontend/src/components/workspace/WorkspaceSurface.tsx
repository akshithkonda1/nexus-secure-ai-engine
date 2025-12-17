import { useMemo } from "react";
import OSBar, { OSBarItem } from "./osbar/OSBar";

type WorkspaceSurfaceProps = {
  items: OSBarItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

export default function WorkspaceSurface({ items, activeId, onSelect }: WorkspaceSurfaceProps) {
  const activeItem = useMemo(() => items.find((item) => item.id === activeId) ?? items[0], [activeId, items]);

  return (
    <div className="flex h-full flex-col gap-8">
      <div className="relative flex-1 rounded-[40px] border border-white/20 bg-white/40 shadow-[0_28px_100px_rgba(10,24,56,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute inset-5 rounded-[34px] border border-white/20" />
        <div className="pointer-events-none absolute inset-x-14 inset-y-16 rounded-[30px] bg-gradient-to-b from-white/45 via-transparent to-transparent" />
        <div className="relative flex h-full flex-col items-center justify-center gap-3 text-center px-6">
          <div className="rounded-full border border-white/40 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] shadow-inner backdrop-blur-sm">
            Center surface is clear
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
            {activeItem ? `${activeItem.label} can project here when invoked. The surface stays open until you call it.` : "Surface ready."}
          </p>
        </div>
      </div>
      <div className="sticky bottom-0">
        <OSBar items={items} activeId={activeId} onSelect={onSelect} />
      </div>
    </div>
  );
}
