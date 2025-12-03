import React from "react";
import { ArrowRight } from "lucide-react";

export function RyuzenContinueTile() {
  return (
    <div className="card-aurora relative overflow-hidden p-5 text-white/90">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.3),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.28),transparent_60%)]" />
      <div className="relative flex flex-col gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Resume</p>
          <h3 className="text-xl font-semibold text-white">Resume Analysis: Project Ryuzen</h3>
          <p className="text-sm text-slate-200">Toron paused on node clustering.</p>
        </div>
        <button
          type="button"
          className="group inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_10px_50px_rgba(56,189,248,0.45)] transition hover:shadow-[0_14px_60px_rgba(56,189,248,0.55)]"
        >
          Continue
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
