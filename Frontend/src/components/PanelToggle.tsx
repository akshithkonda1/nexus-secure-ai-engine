import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  side: "left" | "right";
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
        "group absolute top-3 z-40 h-9 w-9 rounded-full border",
        "border-black/10 bg-white/85 text-slate-600 shadow backdrop-blur",
        "dark:border-white/10 dark:bg-white/10 dark:text-slate-200",
        "transition hover:scale-[1.03] hover:shadow-md",
        isLeft ? "-right-4" : "-left-4",
        className ?? ""
      ].join(" ")}
      data-cy={`toggle-${side}`}
    >
      <Icon className="mx-auto h-4 w-4" />
    </button>
  );
}
