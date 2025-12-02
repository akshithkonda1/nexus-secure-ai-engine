import React from "react";

const ToronPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-white">
      <h2 className="text-2xl font-semibold">Analyze with Toron</h2>
      <p className="text-slate-200/80">
        Toron intelligence will synthesize workspace data for insights. This placeholder previews the analysis console.
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 space-y-2">
        <div className="text-sm text-slate-200/90">• Summaries and highlights</div>
        <div className="text-sm text-slate-200/90">• Signal exploration</div>
        <div className="text-sm text-slate-200/90">• Recommendations</div>
      </div>
    </div>
  );
};

export default ToronPanel;
