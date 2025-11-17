import React from "react";

interface CommandCenterOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function CommandCenterOverlay({ open, onClose }: CommandCenterOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="pointer-events-none flex w-full justify-center px-4">
        <div className="pointer-events-auto w-full max-w-6xl rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950/95 to-slate-900 shadow-[0_32px_120px_rgba(0,0,0,0.9)] p-6 md:p-8">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4 mb-4 md:mb-6">
            <div>
              <p className="text-[11px] tracking-[0.32em] text-slate-400 uppercase">
                Command Center
              </p>
              <h1 className="mt-1 text-xl md:text-2xl font-semibold text-slate-50">
                One place to see what Zora is doing for you.
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-300">
                Lightweight overview of modes, connectors, signals and your next best action.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-slate-900/90 text-slate-200 hover:bg-slate-800 hover:text-white transition"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
          </div>

          {/* MAIN GRID: PS5-STYLE LAYOUT */}
          <div className="grid gap-4 md:gap-5 md:grid-cols-[1.05fr_1.25fr_0.9fr]">
            {/* LEFT COLUMN — MODES + CONNECTORS */}
            <div className="space-y-4">
              {/* Modes */}
              <div className="rounded-2xl bg-slate-900/95 border border-white/10 px-4 py-3">
                <p className="text-xs font-semibold text-slate-100 mb-2">Modes</p>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <ModePill label="Safe Mode" active />
                  <ModePill label="Study Mode" />
                  <ModePill label="Fast Mode" />
                </div>
              </div>

              {/* Connectors */}
              <div className="rounded-2xl bg-slate-900/95 border border-white/10 px-4 py-3 space-y-2">
                <p className="text-xs font-semibold text-slate-100">Connectors</p>
                <ConnectorRow name="Google Drive" status="Synced" tone="emerald" />
                <ConnectorRow name="Canvas / LMS" status="Monitoring" tone="sky" />
                <ConnectorRow name="GitHub" status="Idle" tone="amber" />
              </div>
            </div>

            {/* CENTER COLUMN — QUICK TILES + CONTINUE WORKING */}
            <div className="space-y-4">
              {/* Quick tiles (PS5 tile feel) */}
              <div className="grid gap-3 md:grid-cols-3">
                <QuickTile
                  label="Study Session"
                  description="Auto-notes + citations."
                  accent="from-sky-500/70 to-indigo-500/90"
                />
                <QuickTile
                  label="Infra Watch"
                  description="Logs + anomaly scans."
                  accent="from-emerald-500/70 to-teal-500/90"
                />
                <QuickTile
                  label="Sandbox"
                  description="Playground for prompts."
                  accent="from-fuchsia-500/70 to-purple-500/90"
                />
              </div>

              {/* Continue working — single wide card */}
              <div className="rounded-3xl bg-slate-900/95 border border-white/10 px-5 py-4 flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex h-20 w-full md:w-32 items-center justify-center rounded-2xl bg-slate-800/80 border border-white/10 text-[11px] text-slate-200">
                  <span className="text-center leading-tight">
                    Resume<br />last thread
                  </span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-semibold text-slate-100">
                    Continue working: Healthcare.Gov RDS incident recap
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Zora can summarize logs, extract root causes, and draft a clean incident note.
                  </p>
                </div>
                <button
                  type="button"
                  className="self-start md:self-center rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-sky-400 transition"
                >
                  Open in Workspace
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN — SIGNALS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-100">Signals</p>
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
                detail="+12% vs last week; still within limits."
                badge="Usage"
                tone="emerald"
              />
              <SignalCard
                label="Model reliability"
                detail="One connector has elevated error rates."
                badge="Alert"
                tone="rose"
              />
              <button
                type="button"
                className="mt-1 w-full rounded-full border border-white/15 bg-slate-900/90 px-3 py-2 text-[11px] font-medium text-slate-200 hover:bg-slate-800 transition"
              >
                Customize in Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* HELPER COMPONENTS */

function ModePill({ label, active }: { label: string; active?: boolean }) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1.5 border text-[11px] transition";
  if (active) {
    return (
      <button
        type="button"
        className={`${base} border-sky-400/60 bg-slate-900 text-sky-100`}
      >
        {label}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`${base} border-white/10 bg-slate-900/80 text-slate-200 hover:bg-slate-800`}
    >
      {label}
    </button>
  );
}

type Tone = "emerald" | "sky" | "amber" | "rose";

function ConnectorRow({
  name,
  status,
  tone,
}: {
  name: string;
  status: string;
  tone: "emerald" | "sky" | "amber";
}) {
  const toneClass: Record<"emerald" | "sky" | "amber", string> = {
    emerald: "text-emerald-300",
    sky: "text-sky-300",
    amber: "text-amber-300",
  };
  return (
    <div className="flex items-center justify-between text-[11px] text-slate-200">
      <span>{name}</span>
      <span className={toneClass[tone]}>{status}</span>
    </div>
  );
}

function QuickTile({
  label,
  description,
  accent,
}: {
  label: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-3">
      <div className={`absolute inset-0 opacity-40 bg-gradient-to-br ${accent}`} />
      <div className="relative space-y-1">
        <p className="text-xs font-semibold text-slate-50">{label}</p>
        <p className="text-[11px] text-slate-200">{description}</p>
      </div>
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
