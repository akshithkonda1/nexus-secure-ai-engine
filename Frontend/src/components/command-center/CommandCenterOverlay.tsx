import React from "react";
import { Activity, Cpu, Database, Shield, Zap } from "lucide-react";

interface CommandCenterOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function CommandCenterOverlay({ open, onClose }: CommandCenterOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm">
      <div className="pointer-events-none flex w-full justify-center px-4">
        <div className="pointer-events-auto w-full max-w-6xl rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950/95 to-slate-900 shadow-[0_32px_120px_rgba(0,0,0,0.85)] px-6 py-6 md:px-8 md:py-7">
          {/* TOP BAR: title + status + close */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.32em] text-slate-400 uppercase">
                Zora · Command Center
              </p>
              <h1 className="mt-1 text-xl md:text-2xl font-semibold text-slate-50">
                One place to see what Zora is doing for you.
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-300">
                Live view of your projects, automations, signals, and connected systems powering your workspace.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
                <span className="hidden text-[11px] text-slate-400 md:inline">
                  Engine health: <span className="text-emerald-300">Stable</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-white/12 px-3 py-1 text-[10px] tracking-[0.22em] uppercase text-slate-300">
                  Signals
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white transition"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid gap-4 md:gap-5 md:grid-cols-[260px_minmax(0,1.3fr)_260px]">
            {/* LEFT COLUMN: STATUS / USAGE */}
            <div className="space-y-4">
              {/* Zora Status */}
              <div className="rounded-2xl bg-slate-900/90 px-4 py-3 border border-white/8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/70 to-indigo-500/90">
                      <Cpu className="h-4 w-4 text-slate-50" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-100">
                        Zora Engine
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Orchestrating {`3–5`} models per query
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">
                    99.3% uptime
                  </span>
                </div>
              </div>

              {/* Usage / “Storage” */}
              <div className="rounded-2xl bg-slate-900/90 px-4 py-3 border border-white/8">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-slate-100">
                    Usage this cycle
                  </p>
                  <p className="text-[11px] text-slate-400">
                    18,420 / 50,000 credits
                  </p>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-500" />
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Auto-throttling will kick in at <span className="text-slate-200">90%</span>.
                </p>
              </div>

              {/* Modes */}
              <div className="rounded-2xl bg-slate-900/90 px-4 py-3 border border-white/8 space-y-2">
                <p className="text-xs font-medium text-slate-100 mb-1">
                  Modes
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1.5 text-[11px] font-medium text-slate-100 border border-sky-500/60">
                    <Shield className="h-3 w-3 text-sky-300" />
                    Safe Mode
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-300 border border-white/8">
                    Study Mode
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-300 border border-white/8">
                    Fast Mode
                  </button>
                </div>
              </div>

              {/* Connectors mini strip */}
              <div className="rounded-2xl bg-slate-900/90 px-4 py-3 border border-white/8 space-y-2">
                <p className="text-xs font-medium text-slate-100">
                  Connectors
                </p>
                <div className="space-y-1.5">
                  <RowBadge name="Google Drive" status="Synced" color="emerald" />
                  <RowBadge name="Canvas / LMS" status="Monitoring" color="sky" />
                  <RowBadge name="GitHub" status="Idle" color="amber" />
                </div>
              </div>
            </div>

            {/* CENTER COLUMN: HERO + QUICK ACTIONS */}
            <div className="space-y-4">
              {/* Hero */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
                <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
                <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />

                <div className="relative flex flex-col justify-between gap-4 px-6 py-5 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-medium text-slate-200">
                      Workspace Overview
                    </p>
                    <p className="mt-1 text-[11px] text-slate-300">
                      Zora is prioritizing high-signal work across your active spaces.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                      <TagChip label="3 active projects" />
                      <TagChip label="7 open signals" />
                      <TagChip label="Auto-summaries at 2pm" />
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="relative flex h-20 w-32 items-center justify-center rounded-2xl bg-slate-950/90 border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.45)]">
                      <div className="h-10 w-10 rounded-xl border border-sky-500/70 bg-slate-900 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-sky-300" />
                      </div>
                      <div className="absolute -bottom-2 right-4 rounded-full bg-sky-500/90 px-2 py-0.5 text-[10px] font-semibold text-slate-950 uppercase tracking-[0.18em]">
                        Live
                      </div>
                    </div>
                    <button className="rounded-full bg-slate-100 px-4 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-white transition">
                      Quick Start
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick connectors row (like controller tiles) */}
              <div className="grid gap-3 md:grid-cols-3">
                <TileCard
                  title="Study Session"
                  subtitle="Auto-notes + citations"
                  accent="from-sky-500/70 to-indigo-500/90"
                  icon={<BookGlyph />}
                  footer="Ready"
                />
                <TileCard
                  title="Infra Watch"
                  subtitle="Logs + anomaly scans"
                  accent="from-emerald-500/70 to-teal-500/90"
                  icon={<Activity className="h-5 w-5 text-emerald-100" />}
                  footer="Monitoring"
                />
                <TileCard
                  title="Sandbox"
                  subtitle="Playground for prompts"
                  accent="from-fuchsia-500/70 to-purple-500/90"
                  icon={<Database className="h-5 w-5 text-fuchsia-100" />}
                  footer="Isolated"
                />
              </div>

              {/* Continue working strip */}
              <div className="rounded-3xl border border-white/10 bg-slate-900/95 px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-16 items-center justify-center rounded-2xl bg-slate-800/80 border border-white/10 text-xs text-slate-200">
                    <span className="text-[11px] leading-tight text-center">
                      Resume
                      <br />
                      last thread
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-100">
                      Continue working: Healthcare.Gov RDS incident recap
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Zora can summarize logs, extract root causes, and draft a clean incident note.
                    </p>
                  </div>
                </div>
                <button className="self-start rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-sky-400 transition md:self-center">
                  Open in Workspace
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: SIGNALS FEED */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-100">
                  Signals
                </p>
                <button className="text-[11px] text-slate-400 hover:text-slate-200">
                  View all
                </button>
              </div>

              <SignalCard
                label="Workspace recaps"
                detail="People respond fastest to 2pm summaries."
                badge="Recommendation"
                tone="sky"
              />
              <SignalCard
                label="API usage"
                detail="You’re trending +12% vs last week."
                badge="Usage"
                tone="amber"
              />
              <SignalCard
                label="Model reliability"
                detail="One connector has elevated error rates."
                badge="Alert"
                tone="rose"
              />

              <div className="pt-2">
                <button className="w-full rounded-full border border-white/12 bg-slate-900/80 px-3 py-2 text-[11px] font-medium text-slate-200 hover:bg-slate-800 transition">
                  Customize in Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small internal components */

type Tone = "emerald" | "sky" | "amber" | "rose";

function RowBadge({
  name,
  status,
  color,
}: {
  name: string;
  status: string;
  color: "emerald" | "sky" | "amber";
}) {
  const colorMap: Record<typeof color, string> = {
    emerald: "text-emerald-300",
    sky: "text-sky-300",
    amber: "text-amber-300",
  } as const;

  return (
    <div className="flex items-center justify-between text-[11px] text-slate-300">
      <span>{name}</span>
      <span className={colorMap[color]}>{status}</span>
    </div>
  );
}

function TagChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 border border-white/8 text-[10px] text-slate-200">
      {label}
    </span>
  );
}

interface TileCardProps {
  title: string;
  subtitle: string;
  accent: string;
  icon: React.ReactNode;
  footer: string;
}

function TileCard({ title, subtitle, accent, icon, footer }: TileCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-slate-900/95 px-4 py-3">
      <div className={`absolute inset-0 opacity-40 bg-gradient-to-br ${accent}`} />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-50">{title}</p>
          <p className="mt-1 text-[11px] text-slate-200">{subtitle}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950/80 border border-white/10">
          {icon}
        </div>
      </div>
      <p className="relative mt-3 text-[11px] text-slate-200">{footer}</p>
    </div>
  );
}

function SignalCard({
  label,
  detail,
  badge,
  tone,
}: {
  label: string;
  detail: string;
  badge: string;
  tone: Tone;
}) {
  const pillMap: Record<Tone, string> = {
    emerald: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
    sky: "bg-sky-500/15 text-sky-200 border-sky-400/40",
    amber: "bg-amber-500/15 text-amber-200 border-amber-400/40",
    rose: "bg-rose-500/15 text-rose-200 border-rose-400/40",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-[11px] text-slate-200">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="font-medium text-slate-50">{label}</p>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${pillMap[tone]}`}>
          {badge}
        </span>
      </div>
      <p className="text-slate-300">{detail}</p>
    </div>
  );
}

function BookGlyph() {
  return (
    <div className="flex h-5 w-5 items-center justify-center">
      <span className="h-4 w-4 rounded-sm border border-sky-100/70 bg-sky-200/20" />
    </div>
  );
}
