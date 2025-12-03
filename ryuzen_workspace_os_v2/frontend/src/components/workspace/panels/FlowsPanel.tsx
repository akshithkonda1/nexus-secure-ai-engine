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
            className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e121b] p-4 text-[var(--rz-text)]"
          >
            <span>{flow}</span>
            <span className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e121b] px-3 py-1 text-xs text-[var(--rz-text)]">
              Flow Draft
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowsPanel;
