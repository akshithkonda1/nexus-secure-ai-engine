import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.7)] p-10 text-center text-muted shadow-card">
      {icon ? <div className="text-primary">{icon}</div> : null}
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--text))]">{title}</h3>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>
      {action ?? null}
    </div>
  );
}
