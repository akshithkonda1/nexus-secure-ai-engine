import React from "react";
import { X } from "lucide-react";

interface CommandCenterHeroProps {
  open: boolean;
  onClose: () => void;
}

const sectionCopy = [
  {
    title: "Projects",
    body: "Live initiatives across Atlas, Risk, Signals, and Audit streams with real-time completion telemetry.",
    stats: ["4 in-flight", "23% avg progress"],
  },
  {
    title: "Milestones",
    body: "Critical gates, drafts, and reviews Zora is lining up so nothing slips through sequencing.",
    stats: ["5 due this week", "2 blocked"],
  },
  {
    title: "Chats",
    body: "Transcript summaries and threaded follow-ups from your Workspace conversations and standups.",
    stats: ["3 threads heating up"],
  },
  {
    title: "Connectors",
    body: "Pipelines to Slack, Notion, GitHub, and Drive that keep Command Center continuously updated.",
    stats: ["4 live", "1 healing"],
  },
  {
    title: "Workspace Tasks",
    body: "Priority actions Zora is queuing for you—auto-routed, scheduled, and ready to approve.",
    stats: ["7 queued", "Auto-ranked"],
  },
];

export function CommandCenterHero({ open, onClose }: CommandCenterHeroProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-[6px]">
      <div className="flex h-full w-full items-center justify-center px-4 py-10">
        <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/15 bg-slate-950/95 shadow-[0_30px_120px_rgba(0,0,0,0.85)]">
          <div className="flex flex-col gap-3 border-b border-white/10 px-10 py-8 text-slate-100">
            <div className="flex flex-col gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400/80 sm:flex-row sm:items-center sm:justify-between">
              <span>Command Center</span>
              <span className="rounded-full border border-white/15 px-4 py-1 text-[10px] tracking-[0.4em] text-slate-200/90">
                Signals
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="text-center text-2xl font-semibold text-slate-50 sm:text-left md:text-3xl">
                One place to see what Zora is doing for you.
              </h1>
              <p className="text-center text-sm text-slate-300 sm:text-left">
                Overview of projects, upcoming work, signals, and connectors powering your Workspace.
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-10">
            <div className="grid gap-5 md:grid-cols-2">
              {sectionCopy.map((section) => (
                <section
                  key={section.title}
                  className="rounded-3xl border border-white/10 bg-slate-900/60 px-6 py-5 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400/80">
                    {section.title}
                  </p>
                  <p className="mt-2 text-sm text-slate-200">{section.body}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {section.stats.map((stat) => (
                      <span
                        key={stat}
                        className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-200"
                      >
                        {stat}
                      </span>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 border-t border-white/10 px-6 pb-8 pt-4 text-center text-[11px] text-slate-400">
            <p>Zora uses your settings, connectors, and engine ranking to keep this view relevant.</p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-slate-900/90 text-slate-200 transition hover:border-white/40 hover:text-white"
              aria-label="Close Command Center intro"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
