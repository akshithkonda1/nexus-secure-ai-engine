import React from "react";
import { X } from "lucide-react";

interface CommandCenterHeroProps {
  open: boolean;
  onClose: () => void;
}

export function CommandCenterHero({ open, onClose }: CommandCenterHeroProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="pointer-events-none flex w-full justify-center pt-16">
        <div className="pointer-events-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-slate-950/95 px-8 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.3em] text-slate-300/80 uppercase">
                Command Center
              </p>
              <h1 className="mt-1 text-xl md:text-2xl font-semibold text-slate-50">
                One place to see what Zora is doing for you.
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Overview of projects, upcoming work, signals, and connectors powering your Workspace.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3 text-[11px] tracking-[0.25em] text-slate-300/80 uppercase">
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px]">
                  Signals
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Pills / stats row – you can reuse existing stats here */}
          <div className="mt-6 flex flex-wrap items-stretch gap-3">
            <div className="flex flex-1 flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 px-4 py-2 text-xs text-slate-100">
                <span className="text-slate-300">📈</span>
                <span className="font-medium">23% progress</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 px-4 py-2 text-xs text-slate-100">
                <span className="text-slate-300">📝</span>
                <span className="font-medium">Draft ready</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-slate-900/90 px-4 py-2 text-xs text-slate-100">
                <span className="text-slate-300">⭐</span>
                <span className="font-medium">5 milestones</span>
              </div>
            </div>

            <button
              type="button"
              className="rounded-2xl bg-fuchsia-500/90 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_20px_rgba(217,70,239,0.6)] hover:bg-fuchsia-500 transition"
            >
              Quick Start
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-5 border-t border-white/5 pt-3 text-[11px] text-slate-400">
            Zora uses your settings, connectors, and engine ranking to keep this view relevant.
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandCenterHero;
