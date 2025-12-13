import React from "react";

const FlowsPanel: React.FC = () => {
  return (
    <div className="space-y-4 leading-relaxed text-neutral-800 dark:text-neutral-200">
      <h2 className="text-2xl font-semibold">Flows</h2>
      <p>Design automations and handoffs across the workspace.</p>
      <div className="space-y-3">
        {["Intake → Review", "Signals → Alerts", "Research → Toron"].map((flow) => (
          <div
            key={flow}
            className="
              relative flex items-center justify-between rounded-3xl
              bg-white/85 dark:bg-neutral-900/85
              border border-neutral-300/50 dark:border-neutral-700/50
              text-neutral-800 dark:text-neutral-200
              shadow-[0_4px_20px_rgba(0,0,0,0.12)]
              backdrop-blur-xl
              p-6 md:p-8 z-[10]
            "
          >
            <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
            <span className="relative">{flow}</span>
            <span className="relative rounded-full border border-neutral-300/50 dark:border-neutral-700/50 bg-white/85 dark:bg-neutral-900/85 px-3 py-1 text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl">
              Flow Draft
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowsPanel;
