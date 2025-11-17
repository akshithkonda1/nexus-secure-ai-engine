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
        <div className="pointer-events-auto w-full max-w-5xl rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950/95 to-slate-900 shadow-[0_28px_110px_rgba(0,0,0,0.9)] p-6 md:p-8 grid gap-6 md:grid-cols-[1.1fr_1.2fr]">
          {/* LEFT: STATUS + CONNECTORS */}
          <div className="space-y-4">
            <div>
              <p className="text-[11px] tracking-[0.32em] text-slate-400 uppercase">
                Command Center
              </p>
              <h1 className="mt-1 text-xl md:text-2xl font-semibold text-slate-50">
                Zora workspace snapshot
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-300">
                Quick view of engine status, usage, and connectors—so you know what Zora is doing for you.
              </p>
            </div>

            {/* Engine / Usage */}
            <div className="rounded-2xl bg-slate-900/95 border border-white/10 px-4 py-3">
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span>Usage this cycle</span>
                <span>18,420 / 50,000 credits</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full w-[38%] bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Auto-throttling will kick in at <span className="text-slate-100">90%</span>.
              </p>
            </div>

            {/* Connectors */}
            <div className="rounded-2xl bg-slate-900/95 border border-white/10 px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-100">Connectors</p>
              <ConnectorRow name="Google Drive" status="Synced" tone="emerald" />
              <ConnectorRow name="Canvas / LMS" status="Monitoring" tone="sky" />
              <ConnectorRow name="GitHub" status="Idle" tone="amber" />
            </div>
          </div>

          {/* RIGHT: CONTINUE WORKING + ACTIONS */}
          <div className="space-y-4">
            {/* Continue working card (PS5 continue playing vibe) */}
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
                  Zora can summarize logs, extract root causes, and draft a clean incident note for your workspace.
                </p>
              </div>
              <button
                type="button"
                className="self-start md:self-center rounded-full bg-sky-500 px-4 py-1.5 text-[11px] font-semibold text-slate-950 hover:bg-sky-400 transition"
              >
                Open in Workspace
              </button>
            </div>

            {/* Secondary quick actions */}
            <div className="grid gap-3 md:grid-cols-2">
              <QuickTile
                label="Study session"
                description="Start a focused study mode with notes and citations."
              />
              <QuickTile
                label="Sandbox chat"
                description="Open a scratchpad for safe prompt experiments."
              />
            </div>

            {/* Footer controls */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 bg-slate-900/90 px-4 py-1.5 text-[11px] font-medium text-slate-200 hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small internal helper components */

type Tone = "emerald" | "sky" | "amber";

function ConnectorRow({
  name,
  status,
  tone,
}: {
  name: string;
  status: string;
  tone: Tone;
}) {
  const toneClass: Record<Tone, string> = {
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
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-900/95 border border-white/10 px-4 py-3">
      <p className="text-xs font-semibold text-slate-100">{label}</p>
      <p className="mt-1 text-[11px] text-slate-300">{description}</p>
    </div>
  );
}
