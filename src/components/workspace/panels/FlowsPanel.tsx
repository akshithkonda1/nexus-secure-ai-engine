import React from "react";

const FlowsPanel: React.FC = () => {
  const flows = [
    { name: "Lead Intake", steps: 5 },
    { name: "Security Review", steps: 7 },
    { name: "Delivery", steps: 4 },
  ];

  return (
    <div className="space-y-4 text-white">
      <div className="text-2xl font-semibold tracking-tight">Flows</div>
      <div className="space-y-3">
        {flows.map((flow) => (
          <div
            key={flow.name}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg"
          >
            <div>
              <div className="font-medium">{flow.name}</div>
              <div className="text-sm text-white/60">{flow.steps} steps</div>
            </div>
            <div className="h-2 w-28 rounded-full bg-white/10">
              <div className="h-2 w-1/2 rounded-full bg-emerald-400/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowsPanel;
