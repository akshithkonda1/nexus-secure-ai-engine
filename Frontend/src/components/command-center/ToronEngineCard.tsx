import React from "react";

export function ToronEngineCard() {
  return (
    <div className="card-aurora p-4 lg:p-5 text-white/90 relative overflow-hidden">
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.28),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(129,140,248,0.28),transparent_50%)]" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-indigo-300">Toron</p>
          <h3 className="text-lg font-semibold text-white">Neural Load</h3>
        </div>
        <div className="relative size-16 rounded-full bg-gradient-to-br from-cyan-400/30 via-slate-900 to-indigo-500/30 border border-cyan-400/40">
          <div className="absolute inset-[-18%] rounded-full border border-cyan-400/20 animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-[6%] rounded-full border border-indigo-400/30 animate-[spin_10s_linear_infinite_reverse]" />
          <div className="absolute inset-[25%] rounded-full bg-gradient-to-br from-cyan-300 via-sky-400 to-indigo-500 blur-md opacity-80 animate-pulse" />
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-200">
            <span>Load</span>
            <span className="text-cyan-100 font-semibold">68%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full w-[68%] bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 shadow-[0_0_20px_rgba(56,189,248,0.45)]" />
          </div>
          <p className="text-xs text-slate-300">Adaptive cadence engaged. Thermal safe.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center min-w-[120px]">
          <p className="text-xs text-slate-300">Active models</p>
          <p className="text-2xl font-semibold text-white">4</p>
          <p className="text-[11px] text-slate-400">Heterogeneous routing</p>
        </div>
      </div>
    </div>
  );
}
