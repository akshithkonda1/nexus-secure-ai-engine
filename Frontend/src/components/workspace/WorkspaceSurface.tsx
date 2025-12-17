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
    <div className="flex h-full flex-col gap-4">
      <div className="relative flex-1 rounded-[32px] border border-white/18 bg-white/50 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute inset-4 rounded-[26px] border border-white/15" />
        <div className="pointer-events-none absolute inset-x-10 inset-y-12 rounded-[24px] bg-gradient-to-b from-white/40 via-transparent to-transparent dark:from-white/5" />
        <div className="relative flex h-full flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-full border border-white/30 bg-white/70 px-4 py-2 text-xs font-semibold text-[var(--text-muted)] shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
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
