import React from "react";

const BoardsPanel = () => {
  const lanes = ["Backlog", "In Progress", "Review", "Done"];
  return (
    <div className="space-y-4 text-[var(--text-primary)]">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Workspace Canvas</p>
        <h2 className="text-2xl font-semibold">Boards</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {lanes.map((lane) => (
          <div
            key={lane}
            className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 backdrop-blur-[var(--glass-blur)]"
          >
            <div className="font-medium">{lane}</div>
            <p className="text-sm text-[var(--text-secondary)]">Keep work moving without leaving the canvas.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardsPanel;
