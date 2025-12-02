import React from "react";

const TasksPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-white">
      <h2 className="text-2xl font-semibold">Tasks</h2>
      <p className="text-slate-200/80">
        Track tasks and responsibilities. This placeholder will evolve into a full task manager inside the workspace canvas.
      </p>
      <div className="space-y-2">
        {[
          "Review integrations",
          "Draft architecture notes",
          "Sync with design team",
          "Prepare Toron analysis",
        ].map((task) => (
          <div
            key={task}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4"
          >
            <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
            <span>{task}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPanel;
