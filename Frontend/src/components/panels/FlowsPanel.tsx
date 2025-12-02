import React from "react";
import { Route as RouteIcon, Zap } from "lucide-react";

const FlowsPanel: React.FC = () => (
  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
    <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
      <RouteIcon className="h-4 w-4" /> Flows
    </div>
    <p className="text-sm text-white/70">Design orchestration paths for live collaborations.</p>
    <div className="mt-4 space-y-2">
      {["Collect signals", "Draft insights", "Ship with Toron"].map((flow) => (
        <div key={flow} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
          <span>{flow}</span>
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-emerald-200">
            <Zap className="h-3 w-3" /> Auto
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default FlowsPanel;
