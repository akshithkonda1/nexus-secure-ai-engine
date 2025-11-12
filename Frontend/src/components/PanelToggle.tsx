import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  side: "left" | "right";
  open: boolean;
  onClick: () => void;
  className?: string;
  label?: string;
};

export function PanelToggle({ side, open, onClick, className, label }: Props) {
  const isLeft = side === "left";
  const icon = isLeft
    ? open ? <ChevronLeft className="mx-auto h-4 w-4" /> : <ChevronRight className="mx-auto h-4 w-4" />
    : open ? <ChevronRight className="mx-auto h-4 w-4" /> : <ChevronLeft className="mx-auto h-4 w-4" />;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!open}
      aria-label={label ?? (isLeft ? "Toggle left sidebar" : "Toggle right rail")}
      className={[
        "group absolute top-3 z-40 h-9 w-9 rounded-full border",
        "border-black/10 bg-white/80 text-slate-600 shadow",
        "dark:border-white/10 dark:bg-white/10 dark:text-slate-200",
        "backdrop-blur transition hover:scale-[1.03] hover:shadow-md",
        isLeft ? "-right-4" : "-left-4",
        className ?? ""
      ].join(" ")}
      data-cy={`toggle-${side}`}
    >
      {icon}
    </button>
  );
}
