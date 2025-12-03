import React from "react";

const BoardsPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-[var(--rz-text)]">
      <h2 className="text-2xl font-semibold text-[var(--rz-text)]">Boards</h2>
      <p className="text-[var(--rz-text)]">Visualize workflows in lanes.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["Backlog", "In Progress", "Review"].map((column) => (
          <div
            key={column}
            className="space-y-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e121b] p-4 text-[var(--rz-text)]"
          >
            <p className="text-sm font-semibold text-[var(--rz-text)]">{column}</p>
            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e121b] p-3 text-xs text-[var(--rz-text)]">
              Card A
            </div>
            <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e121b] p-3 text-xs text-[var(--rz-text)]">
              Card B
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardsPanel;
