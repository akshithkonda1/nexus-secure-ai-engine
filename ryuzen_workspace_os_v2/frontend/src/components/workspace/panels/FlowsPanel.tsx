import React from "react";

const FlowsPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-white">
      <h2 className="text-2xl font-semibold">Flows</h2>
      <p className="text-slate-200/80">
        Design automations and handoffs. Flows will orchestrate your data moving through the workspace.
      </p>
      <div className="space-y-2">
        {["Intake → Review", "Signals → Alerts", "Research → Toron"].map((flow) => (
          <div
            key={flow}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4 flex items-center justify-between"
          >
            <span>{flow}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15">Flow Draft</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowsPanel;
