import React from "react";

const ToronPanel: React.FC = () => {
  const insights = [
    "Summarize current workspace signals",
    "Identify risk hotspots",
    "Draft action plan for next sprint",
  ];

  return (
    <div className="space-y-4 text-white">
      <div className="text-2xl font-semibold tracking-tight">Analyze with Toron</div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
        <p className="text-white/70">AI assistance tailored to your workspace OS.</p>
        <div className="mt-4 space-y-2">
          {insights.map((insight) => (
            <div key={insight} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80">
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToronPanel;
