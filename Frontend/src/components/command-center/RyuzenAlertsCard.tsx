import React from "react";

const alerts = [
  "New Model Added: Gemini 2.0",
  "Connector Requires Reauth",
  "Google API Refresh Suggested",
];

export function RyuzenAlertsCard() {
  return (
    <div className="card-aurora p-4 lg:p-5 text-white/90">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-rose-200">Alerts</p>
          <h3 className="text-lg font-semibold text-white">Ryuzen Alerts</h3>
        </div>
        <span className="rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-xs text-rose-100">
          {alerts.length} new
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <li
            key={alert}
            className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 text-sm text-slate-100"
          >
            <span className="mt-1 h-2 w-2 rounded-full bg-rose-300 shadow-[0_0_12px_rgba(248,113,113,0.6)]" />
            <span>{alert}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
