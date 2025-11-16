import { Bell } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ count = 0, onClick, className }: NotificationBellProps) {
  const hasUnread = count > 0;
  const displayCount = count > 99 ? "99+" : String(count);
  const ariaLabel = hasUnread ? `${displayCount} unread notifications` : "No unread notifications";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-full border text-[rgba(var(--subtle),0.85)] transition",
        "bg-[rgba(var(--surface),0.92)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgba(var(--status-critical),0.75)] focus-visible:ring-offset-[rgba(15,23,42,0.45)]",
        hasUnread
          ? "border-[rgba(var(--status-critical),0.9)] text-[rgb(var(--status-critical))] shadow-[0_0_0_1px_rgba(var(--status-critical),0.2),0_0_18px_rgba(var(--status-critical),0.45)]"
          : "border-[rgba(var(--border),0.55)] text-[rgba(var(--subtle),0.75)] shadow-[0_8px_20px_rgba(0,0,0,0.12)]",
        className,
      )}
    >
      <Bell className={cn("size-4 transition", hasUnread && "text-[rgb(var(--status-critical))]")} aria-hidden="true" />
      {hasUnread ? (
        <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[rgb(var(--status-critical))] px-1 text-[10px] font-semibold text-[rgb(var(--on-accent))]">
          {displayCount}
        </span>
      ) : null}
    </button>
  );
}
