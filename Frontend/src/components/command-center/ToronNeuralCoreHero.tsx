import React from "react";

export function ToronNeuralCoreHero() {
  return (
    <div className="card-aurora relative overflow-hidden p-6 text-textPrimary/90">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.25),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(99,102,241,0.3),transparent_60%)]" />
      <div className="absolute inset-6 rounded-[32px] border border-cyan-400/15" />

      <div className="relative flex flex-col items-center gap-4 text-center">
        <div className="relative mt-2 h-56 w-56">
          <div className="absolute inset-8 rounded-full border border-cyan-400/25 blur-md" />
          <div className="absolute inset-6 rounded-full border border-indigo-400/20 animate-[spin_24s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400/30 via-slate-900 to-indigo-500/30 backdrop-blur-xl shadow-[0_0_60px_rgba(56,189,248,0.35)]" />
          <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white to-cyan-200 shadow-[0_0_35px_rgba(56,189,248,0.6)] animate-pulse" />
          <div className="absolute inset-0 animate-[spin_14s_linear_infinite] rounded-full border border-cyan-500/30" />
          <div className="absolute inset-4 animate-[spin_10s_linear_infinite_reverse] rounded-full border border-indigo-400/25" />
          <div className="absolute inset-[18%] animate-[pulse_3.6s_ease-in-out_infinite] rounded-full border border-borderLight/10" />
          <div className="absolute inset-3 rounded-full blur-3xl bg-cyan-500/25" />
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Toron Neural Core</p>
          <h3 className="text-2xl font-semibold text-textPrimary">Toron Horizon v1.6</h3>
          <p className="text-sm text-textMuted">Active Models: GPT-5, Sonnet, Qwen, DeepSeek</p>
          <p className="text-sm text-emerald-200">Pattern Learning: ↑ 17%</p>
        </div>
      </div>
    </div>
  );
}
