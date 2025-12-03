import React from "react";

const ToronPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-[var(--rz-text)]">
      <h2 className="text-2xl font-semibold text-[var(--rz-text)]">Analyze with Toron</h2>
      <p className="text-[var(--rz-text)]">Toron intelligence will synthesize workspace data for insights.</p>
      <div
        className="space-y-2 rounded-2xl border p-6 text-[var(--rz-text)]"
        style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface)" }}
      >
        <div className="text-sm text-[var(--rz-text)]">• Summaries and highlights</div>
        <div className="text-sm text-[var(--rz-text)]">• Signal exploration</div>
        <div className="text-sm text-[var(--rz-text)]">• Recommendations</div>
      </div>
    </div>
  );
};

export default ToronPanel;
