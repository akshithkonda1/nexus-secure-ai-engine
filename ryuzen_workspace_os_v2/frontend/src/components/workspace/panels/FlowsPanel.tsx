import React from "react";

const FlowsPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-[var(--rz-text)]">
      <h2 className="text-2xl font-semibold text-[var(--rz-text)]">Flows</h2>
      <p className="text-[var(--rz-text)]">Design automations and handoffs across the workspace.</p>
      <div className="space-y-2">
        {["Intake → Review", "Signals → Alerts", "Research → Toron"].map((flow) => (
          <div
            key={flow}
            className="flex items-center justify-between rounded-2xl border p-4 text-[var(--rz-text)]"
            style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface)" }}
          >
            <span>{flow}</span>
            <span
              className="rounded-full px-3 py-1 text-xs text-[var(--rz-text)]"
              style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
            >
              Flow Draft
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowsPanel;
