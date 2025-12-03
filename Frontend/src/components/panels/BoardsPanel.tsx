import React from "react";
import { Kanban } from "lucide-react";

const glassPanelClass =
  "bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong";

const BoardsPanel: React.FC<{ close?: () => void }> = ({ close }) => (
  <div className={`${glassPanelClass} flex flex-col gap-4`}>
    <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-textSecondary">
      <span className="flex items-center gap-2 text-textPrimary">
        <Kanban className="h-4 w-4" /> Boards
      </span>
      {close && (
        <button
          onClick={close}
          className="rounded-full border border-glassBorder px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-textPrimary transition hover:border-glassBorderStrong"
        >
          Close
        </button>
      )}
    </div>
    <p className="text-sm text-textMuted">Visual swimlanes for delivery workstreams.</p>
    <div className="grid gap-3 md:grid-cols-3">
      {["Intent", "Build", "Validate"].map((lane) => (
        <div key={lane} className={`${glassPanelClass} p-3 shadow-none`}>
          <div className="text-sm font-semibold text-textPrimary">{lane}</div>
          <p className="mt-1 text-xs text-textMuted">Drop cards here to reprioritize.</p>
        </div>
      ))}
    </div>
  </div>
);

export default BoardsPanel;
