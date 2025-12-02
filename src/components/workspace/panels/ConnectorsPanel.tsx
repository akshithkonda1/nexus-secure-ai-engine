import React from "react";

const ConnectorsPanel: React.FC = () => {
  const connectors = [
    { name: "GitHub", status: "Live", color: "bg-emerald-500/70" },
    { name: "Slack", status: "Listening", color: "bg-sky-500/70" },
    { name: "Jira", status: "Syncing", color: "bg-amber-500/70" },
    { name: "Notion", status: "Ready", color: "bg-indigo-500/70" },
  ];

  return (
    <div className="space-y-4 text-white">
      <div className="text-2xl font-semibold tracking-tight">Connectors</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {connectors.map((connector) => (
          <div
            key={connector.name}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg"
          >
            <div>
              <div className="font-medium">{connector.name}</div>
              <div className="text-sm text-white/60">{connector.status}</div>
            </div>
            <div className={`h-2 w-2 rounded-full ${connector.color}`}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectorsPanel;
