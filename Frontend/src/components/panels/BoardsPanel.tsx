import React from "react";
import { Kanban } from "lucide-react";

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const BoardsPanel: React.FC<{ close?: () => void }> = ({ close }) => (
  <div className={`${surfaceClass} flex flex-col gap-4`}>
    <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-textSecondary">
      <span className="flex items-center gap-2 text-textPrimary">
        <Kanban className="h-4 w-4" /> Boards
      </span>
      {close && (
        <button
          onClick={close}
          className="rounded-full border border-neutral-300/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-textPrimary transition hover:border-neutral-400 dark:border-neutral-700/50 dark:hover:border-neutral-600"
        >
          Close
        </button>
      )}
    </div>
    <p className="text-sm text-textMuted">Visual swimlanes for delivery workstreams.</p>
    <div className="grid gap-3 md:grid-cols-3">
      {["Intent", "Build", "Validate"].map((lane) => (
        <div key={lane} className={`${surfaceClass} p-3`}>
          <div className="text-sm font-semibold text-textPrimary">{lane}</div>
          <p className="mt-1 text-xs text-textMuted">Drop cards here to reprioritize.</p>
        </div>
      ))}
    </div>
  </div>
);

export default BoardsPanel;
