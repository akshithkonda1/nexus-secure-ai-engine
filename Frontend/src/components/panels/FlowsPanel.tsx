import React from "react";
import { Route as RouteIcon, Zap } from "lucide-react";

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const FlowsPanel: React.FC<{ close?: () => void }> = ({ close }) => (
  <div className={`${surfaceClass} flex flex-col gap-4`}>
    <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-textSecondary">
      <span className="flex items-center gap-2 text-textPrimary">
        <RouteIcon className="h-4 w-4" /> Flows
      </span>
      {close && (
        <button
          onClick={close}
          className="rounded-full border border-neutral-300/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-textPrimary transition hover:border-neutral-400 dark:border-neutral-700/50 dark:hover:border-neutral-600"
        >
          Close
        </button>
      )}
    </div>
    <p className="text-sm text-textMuted">Design orchestration paths for live collaborations.</p>
    <div className="space-y-2">
      {["Collect signals", "Draft insights", "Ship with Toron"].map((flow) => (
        <div key={flow} className={`${surfaceClass} flex items-center justify-between p-3`}>
          <span className="text-textPrimary">{flow}</span>
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-emerald-500">
            <Zap className="h-3 w-3" /> Auto
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default FlowsPanel;
