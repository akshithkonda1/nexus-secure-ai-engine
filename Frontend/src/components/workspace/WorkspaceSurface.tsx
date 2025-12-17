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
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_58%,rgba(10,18,40,0.12))]" />
        <div className="relative h-full" aria-label={activeItem?.label} />
      </div>
      <div className="sticky bottom-0">
        <OSBar items={items} activeId={activeId} onSelect={onSelect} />
      </div>
    </div>
  );
}
