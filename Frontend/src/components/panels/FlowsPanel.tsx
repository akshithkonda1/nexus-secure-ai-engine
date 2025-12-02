import React from "react";
import { Route as RouteIcon, Zap } from "lucide-react";

const FlowsPanel: React.FC = () => (
  <div className="fade-in scale-in mx-auto max-w-3xl rounded-[32px] border border-white/15 bg-white/5 p-8 text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
        <RouteIcon className="h-4 w-4" /> Flows
      </div>
      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-200">Auto Orchestration</span>
    </div>

    <p className="mt-3 text-sm text-white/70">Design orchestration paths for live collaborations.</p>

    <div className="mt-6 space-y-3">
      {["Collect signals", "Draft insights", "Ship with Toron"].map((flow) => (
        <div
          key={flow}
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 transition duration-200 ease-out hover:bg-white/10"
        >
          <span className="text-base font-semibold text-white">{flow}</span>
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-emerald-200">
            <Zap className="h-3 w-3" /> Auto
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default FlowsPanel;
