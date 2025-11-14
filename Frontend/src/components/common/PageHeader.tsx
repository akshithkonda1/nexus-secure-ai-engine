import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-xl border border-[rgba(var(--border),0.35)] bg-[rgba(var(--panel),0.75)] px-6 py-8 text-[rgb(var(--text))] shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--text))] sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </header>
  );
}
