import React from "react";

const ConnectorsPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-white">
      <h2 className="text-2xl font-semibold">Connectors</h2>
      <p className="text-slate-200/80">
        Bridge your tools and data sources. Configure API links, webhooks, and automations from this hub.
      </p>
      <div className="space-y-2">
        {["Toron Cloud", "Data Lake", "Notifications", "Workspace Bots"].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4 flex items-center justify-between"
          >
            <span>{item}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/15">Ready</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectorsPanel;
