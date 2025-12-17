import React from "react";

const WorkspaceShell: React.FC = () => (
  <div className="flex h-full flex-col gap-6 rounded-2xl border border-white/20 bg-white/70 p-6 text-[var(--text-primary)] shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-white/10">
    <header className="space-y-1">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--text-muted)]">Ryuzen Workspace OS</p>
      <h1 className="text-2xl font-semibold text-[var(--text-strong)]">Control Center</h1>
      <p className="text-sm text-[var(--text-muted)]">
        The interactive workspace is temporarily unavailable. Functionality will return in a future update.
      </p>
    </header>

    <div className="grid gap-4 rounded-xl border border-dashed border-[var(--line-subtle)] bg-white/60 p-6 text-[var(--text-muted)] dark:bg-white/5">
      <p className="text-sm">Widget canvas, connectors, lists, calendar, and task controls will appear here when restored.</p>
      <p className="text-xs">Until then, you can continue using Toron chat for assistance.</p>
    </div>
  </div>
);

export default WorkspaceShell;
