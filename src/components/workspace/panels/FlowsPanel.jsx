import React from "react";

const FlowsPanel = () => {
  const flows = [
    { name: "Automation", detail: "Trigger connectors and tasks from one place." },
    { name: "Review", detail: "Route approvals without leaving canvas." },
  ];
  return (
    <div className="space-y-4 text-[var(--text-primary)]">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Workspace Canvas</p>
        <h2 className="text-2xl font-semibold">Flows</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {flows.map((flow) => (
          <div
            key={flow.name}
            className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 backdrop-blur-[var(--glass-blur)]"
          >
            <div className="font-medium">{flow.name}</div>
            <p className="text-sm text-[var(--text-secondary)]">{flow.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowsPanel;
