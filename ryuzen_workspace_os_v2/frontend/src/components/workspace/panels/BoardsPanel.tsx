import React from "react";

const BoardsPanel: React.FC = () => {
  return (
    <div className="space-y-4 leading-relaxed text-neutral-800 dark:text-neutral-200">
      <h2 className="text-2xl font-semibold">Boards</h2>
      <p>Visualize workflows in lanes.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["Backlog", "In Progress", "Review"].map((column) => (
          <div
            key={column}
            className="relative space-y-3 rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl p-6 md:p-8 z-[10]"
          >
            <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
            <p className="relative text-sm font-semibold">{column}</p>
            <div className="relative rounded-xl border border-neutral-300/50 dark:border-neutral-700/50 bg-white/85 dark:bg-neutral-900/85 p-3 text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl">
              Card A
            </div>
            <div className="relative rounded-xl border border-neutral-300/50 dark:border-neutral-700/50 bg-white/85 dark:bg-neutral-900/85 p-3 text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl">
              Card B
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardsPanel;
