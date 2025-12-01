import React from "react";

const BottomBar: React.FC = () => {
  return (
    <div className="sticky bottom-0 z-10 mt-6 w-full rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_95%,transparent)] px-6 py-4 shadow-xl shadow-black/10 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">Workspace Quick Actions</p>
          <p className="text-xs text-[var(--text-secondary)]">Keep focus sessions, tasks, and notes in sync as you work.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:text-white">
            Invite Teammate
          </button>
          <button className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg hover:shadow-emerald-500/35">
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
