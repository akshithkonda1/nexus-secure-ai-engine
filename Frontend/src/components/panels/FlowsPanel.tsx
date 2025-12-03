import React from "react";
import { Route as RouteIcon, Zap } from "lucide-react";

const glassPanelClass =
  "relative bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-3xl px-6 py-5 transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-glassInner before:blur-xl before:pointer-events-none hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong hover:scale-[1.01]";

const FlowsPanel: React.FC<{ close?: () => void }> = ({ close }) => (
  <div className={`${glassPanelClass} flex flex-col gap-4`}>
    <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-textSecondary">
      <span className="flex items-center gap-2 text-textPrimary">
        <RouteIcon className="h-4 w-4" /> Flows
      </span>
      {close && (
        <button
          onClick={close}
          className="rounded-full border border-glassBorder px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-textPrimary transition hover:border-glassBorderStrong"
        >
          Close
        </button>
      )}
    </div>
    <p className="text-sm text-textMuted">Design orchestration paths for live collaborations.</p>
    <div className="space-y-2">
      {["Collect signals", "Draft insights", "Ship with Toron"].map((flow) => (
        <div key={flow} className={`${glassPanelClass} flex items-center justify-between p-3 shadow-none`}>
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
