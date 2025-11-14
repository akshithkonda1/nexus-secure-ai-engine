import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PanelSide } from "@/constants/panels";

type Props = {
  side: PanelSide;
  open: boolean;
  onClick: () => void;
  className?: string;
};

export function PanelToggle({ side, open, onClick, className }: Props) {
  const isLeft = side === "left";
  const Icon = isLeft
    ? (open ? ChevronLeft : ChevronRight)
    : (open ? ChevronRight : ChevronLeft);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={isLeft ? "Toggle left sidebar" : "Toggle right rail"}
      className={[
        "group absolute top-3 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(var(--border),0.55)] bg-[rgba(var(--panel),0.7)] text-[rgba(var(--subtle),0.85)] shadow-[0_18px_40px_rgba(15,23,42,0.25)] backdrop-blur-xl transition hover:bg-[rgba(var(--panel),0.82)] hover:shadow-[0_0_32px_rgba(0,133,255,0.35)] hover:scale-[1.01] active:scale-[0.99]",
        isLeft ? "-right-4" : "-left-4",
        className ?? ""
      ].join(" ")}
      data-cy={`toggle-${side}`}
    >
      <Icon className="mx-auto h-4 w-4" />
    </button>
  );
}
