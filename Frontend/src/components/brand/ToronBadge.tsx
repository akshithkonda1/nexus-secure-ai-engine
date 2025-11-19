import React from "react";

export interface ToronBadgeProps {
  className?: string;
}

export const ToronBadge: React.FC<ToronBadgeProps> = ({ className }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide text-[var(--ryuzen-text)] shadow-sm transition-colors ${className ?? ""}`}
    style={{
      borderColor: "var(--ryuzen-border-subtle)",
      backgroundColor: "rgba(2, 3, 19, 0.85)",
    }}
  >
    Powered by Toron
  </span>
);

export default ToronBadge;
