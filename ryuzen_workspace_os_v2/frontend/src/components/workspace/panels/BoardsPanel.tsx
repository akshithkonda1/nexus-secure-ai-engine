import React from "react";

const BoardsPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-white">
      <h2 className="text-2xl font-semibold">Boards</h2>
      <p className="text-slate-200/80">
        Visualize workflows in lanes. This placeholder previews how kanban-style boards will live inside the workspace.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {["Backlog", "In Progress", "Review"].map((column) => (
          <div key={column} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-white/90">{column}</p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200/80">Card A</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-200/80">Card B</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardsPanel;
