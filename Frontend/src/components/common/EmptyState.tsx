import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-elevated/80 p-10 text-center text-muted shadow-card">
      {icon ? <div className="text-primary">{icon}</div> : null}
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>
      {action ?? null}
    </div>
  );
}
