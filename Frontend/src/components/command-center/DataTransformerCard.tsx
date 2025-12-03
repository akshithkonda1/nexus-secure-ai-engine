import React from "react";

export function DataTransformerCard() {
  return (
    <div className="card-aurora relative overflow-hidden p-4 lg:p-5 text-textPrimary/90">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(circle_at_90%_80%,rgba(99,102,241,0.18),transparent_60%)]" />
      <div className="absolute -left-10 top-1/3 h-32 w-32 rounded-full border border-cyan-400/20 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Pipelines</p>
          <h3 className="text-lg font-semibold text-textPrimary">Data Transformer</h3>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs text-emerald-100">
          Healthy
        </span>
      </div>

      <div className="relative mt-4">
        <div className="h-28 overflow-hidden rounded-2xl border border-borderLight/10 bg-bgPrimary/5 p-4">
          <div className="relative h-full w-full">
            <div className="absolute inset-0 animate-[spin_14s_linear_infinite] rounded-full border border-cyan-400/20" />
            <div className="absolute inset-[12%] animate-[spin_10s_linear_infinite_reverse] rounded-full border border-indigo-400/20" />
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_25px_rgba(56,189,248,0.65)]" />
            <div className="absolute left-[18%] top-[28%] h-1 w-12 rounded-full bg-gradient-to-r from-cyan-300/80 via-indigo-300/50 to-transparent blur-[2px] animate-[pulse_2.6s_ease-in-out_infinite]" />
            <div className="absolute right-[18%] bottom-[30%] h-1 w-16 rounded-full bg-gradient-to-r from-indigo-300/70 via-cyan-300/60 to-transparent blur-[1.5px] animate-[pulse_3.2s_ease-in-out_infinite]" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-textMuted">
          <span>Transformation health</span>
          <span className="font-semibold text-cyan-100">98.4%</span>
        </div>
      </div>
    </div>
  );
}
