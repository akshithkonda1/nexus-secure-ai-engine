import { Orbit } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface CommandCenterButtonProps {
  onClick: () => void;
  className?: string;
}

export function CommandCenterButton({ onClick, className }: CommandCenterButtonProps) {
  return (
    <button
      type="button"
      aria-label="Open Command Center"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full border px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.24em] text-[rgba(var(--subtle),0.85)] transition",
        "bg-[rgba(var(--panel),0.92)] border-[rgba(var(--accent-emerald),0.85)] shadow-[0_0_16px_rgba(var(--accent-emerald),0.55)]",
        "hover:text-[rgba(255,255,255,0.95)] hover:shadow-[0_0_26px_rgba(var(--accent-emerald),0.75)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--accent-emerald),0.65)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(15,23,42,0.5)]",
        className,
      )}
    >
      <span className="relative inline-flex size-9 items-center justify-center overflow-hidden rounded-full">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_25%_20%,rgba(var(--accent-emerald),0.95),rgba(var(--brand-soft),0.85))]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full opacity-60 blur-[10px] bg-[rgba(var(--accent-emerald),0.75)]"
        />
        <Orbit className="relative size-4 text-[rgba(6,24,10,0.85)]" />
      </span>
      <span className="whitespace-nowrap">Command Center</span>
    </button>
  );
}
