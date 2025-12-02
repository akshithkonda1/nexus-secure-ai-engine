import React from "react";
import { Kanban } from "lucide-react";

const BoardsPanel: React.FC<{ close?: () => void }> = ({ close }) => (
  <div className="rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-6 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
    <div className="mb-3 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
      <span className="flex items-center gap-2"><Kanban className="h-4 w-4" /> Boards</span>
      {close && (
        <button
          onClick={close}
          className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-1 text-[11px] uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_70%,transparent)]"
        >
          Close
        </button>
      )}
    </div>
    <p className="text-sm text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">Visual swimlanes for delivery workstreams.</p>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      {["Intent", "Build", "Validate"].map((lane) => (
        <div key={lane} className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-3 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
          <div className="text-sm font-semibold text-[var(--text)]">{lane}</div>
          <p className="mt-1 text-xs text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">Drop cards here to reprioritize.</p>
        </div>
      ))}
    </div>
  </div>
);

export default BoardsPanel;
