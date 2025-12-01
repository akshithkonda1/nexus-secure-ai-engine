import React from "react";

const FocusWidget: React.FC = () => {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] p-6 shadow-lg shadow-black/5">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Focus Session</h3>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-500">Deep Work</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Set a quick focus timer to make progress on your most important task.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button className="rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition hover:shadow-lg hover:shadow-emerald-500/35">
          Start 25m Session
        </button>
        <button className="rounded-full border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)] hover:text-white">
          Create Routine
        </button>
      </div>
    </div>
  );
};

export default FocusWidget;
