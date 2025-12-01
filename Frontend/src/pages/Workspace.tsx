import React from "react";

import WorkspaceDashboard from "@/components/workspace/WorkspaceDashboard";

const Workspace: React.FC = () => {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] px-6 py-5 shadow-lg shadow-black/5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-secondary)]">Ryuzen Workspace</p>
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Your daily control center</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Track tasks, schedule focus time, and keep notes aligned across your projects.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:text-white">
              Customize
            </button>
            <button className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg hover:shadow-emerald-500/35">
              New Workspace
            </button>
          </div>
        </div>
      </header>

      <WorkspaceDashboard />
    </div>
  );
};

export default Workspace;
