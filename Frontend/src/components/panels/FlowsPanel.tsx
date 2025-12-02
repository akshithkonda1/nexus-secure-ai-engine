import React from "react";
import { Route as RouteIcon, Zap } from "lucide-react";

const FlowsPanel: React.FC = () => (
  <div className="rounded-[32px] border border-black/10 bg-black/5 p-6 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
    <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
      <RouteIcon className="h-4 w-4" /> Flows
    </div>
    <p className="text-sm text-black/70 dark:text-white/70">Design orchestration paths for live collaborations.</p>
    <div className="mt-4 space-y-2">
      {["Collect signals", "Draft insights", "Ship with Toron"].map((flow) => (
        <div key={flow} className="flex items-center justify-between rounded-2xl border border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-white/5">
          <span className="text-black/80 dark:text-white/80">{flow}</span>
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-emerald-600 dark:text-emerald-200">
            <Zap className="h-3 w-3" /> Auto
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default FlowsPanel;
