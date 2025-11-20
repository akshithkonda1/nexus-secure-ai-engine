import React from "react";

export function RyuzenSystemCard() {
  return (
    <div className="card-aurora p-4 lg:p-5 text-white/90">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">System</p>
          <h3 className="text-lg font-semibold text-white">Ryuzen Status</h3>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-200 border border-cyan-400/30">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 animate-pulse" />
          Online
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm text-slate-200">
            <span>Toron Stability</span>
            <span className="text-cyan-100 font-semibold">92%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/5">
            <div className="progress-flowline h-full w-[92%] shadow-[0_0_24px_rgba(56,189,248,0.45)]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-300">Context Depth</p>
            <p className="text-lg font-semibold text-white">64K tokens</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-slate-300">Signal Health</p>
            <p className="text-lg font-semibold text-emerald-200">Stable</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          System running with adaptive guardrails. Latency minimized; ready for multimodal orchestration.
        </p>
      </div>
    </div>
  );
}
