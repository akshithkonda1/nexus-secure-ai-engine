import React, { useEffect } from "react";

import { CommandCenterHero } from "@/components/command-center/CommandCenterHero";
import { Switch } from "@/shared/ui/components/switch";

// TODO: Replace with data from /api/command-center/overview
const mockProjects = [
  {
    id: "atlas-briefings",
    name: "Atlas Intelligence Briefings",
    summary: "Turning compliance playbooks into live guardrails for Workspace.",
    progress: 68,
    due: "Due in 2 days",
    owner: "Workspace",
    milestones: 4,
  },
  {
    id: "risk-decks",
    name: "Risk & Signals Deck",
    summary: "Packaging telemetry into a shareable executive readout.",
    progress: 42,
    due: "Due next week",
    owner: "Zora",
    milestones: 6,
  },
  {
    id: "audit-layer",
    name: "Audit Layer Automation",
    summary: "Mapping SOC2 and ISO controls to every Workspace activity.",
    progress: 84,
    due: "Due tomorrow",
    owner: "Security",
    milestones: 2,
  },
  {
    id: "signals-console",
    name: "Signals Console",
    summary: "Cross-project insight feed for leadership check-ins.",
    progress: 23,
    due: "Draft ready",
    owner: "Ops",
    milestones: 5,
  },
];

const mockUpcoming = [
  { id: "u1", title: "Publish the compliance matrix", eta: "Today 4:30p", owner: "Workspace" },
  { id: "u2", title: "Review signal routing rules", eta: "Tomorrow 9:00a", owner: "Zora" },
  { id: "u3", title: "Sync research connectors", eta: "Thu 2:00p", owner: "Ops" },
  { id: "u4", title: "Send FYI to legal reviewers", eta: "Fri 11:15a", owner: "Legal" },
];

const mockSignals = [
  {
    id: "s1",
    type: "Pattern",
    title: "Deep research afternoons",
    detail: "You finish 80% of audits between 1-4p. Calendar holds are respected.",
  },
  {
    id: "s2",
    type: "Gap",
    title: "Connector drift",
    detail: "Slack + Notion fell out of sync twice this week. Recommend auto-heal.",
  },
  {
    id: "s3",
    type: "Opportunity",
    title: "Workspace recaps",
    detail: "People respond fastest to 2pm summaries. Schedule auto drops there.",
  },
];

const mockConnectors = [
  { id: "drive", name: "Google Drive", status: "Live", lastSync: "2m ago" },
  { id: "notion", name: "Notion", status: "Syncing", lastSync: "8m ago" },
  { id: "github", name: "GitHub", status: "Live", lastSync: "Just now" },
  { id: "slack", name: "Slack", status: "Paused", lastSync: "1d ago" },
];

type CommandCenterProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CommandCenter({ isOpen, onClose }: CommandCenterProps) {
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [heroOpen, setHeroOpen] = React.useState(true);

  useEffect(() => {
    if (isOpen) {
      setHeroOpen(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawerVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!isOpen) {
    return null;
  }

  const [focusProject, ...otherProjects] = mockProjects;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const allowClose = typeof window === "undefined" || window.innerWidth >= 1024;
    if (event.target === event.currentTarget && allowClose) {
      onClose();
    }
  };

  return (
    <>
      <CommandCenterHero open={isOpen && heroOpen} onClose={() => setHeroOpen(false)} />
      <div
        className="fixed inset-0 z-30 bg-slate-950/75 backdrop-blur-md"
        onClick={handleBackdropClick}
      >
      <div className="flex h-full w-full justify-end">
        <section
          role="dialog"
          aria-modal="true"
          aria-label="Command Center"
          className={`relative flex h-full w-full max-w-5xl flex-col border-l border-white/10 bg-[radial-gradient(circle_at_top,_rgba(var(--brand-soft),0.22),_transparent)_0_0/100%_40%_no-repeat,_rgba(3,7,18,0.95)] shadow-[0_0_60px_rgba(0,0,0,0.65)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${drawerVisible ? "translate-x-0" : "translate-x-full"}`}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(var(--border),0.35)] px-6 py-4">
            <div className="flex flex-wrap gap-3 text-right text-sm">
              <ModeToggle label="Safe mode" defaultChecked />
              <ModeToggle label="Study mode" />
              <ModeToggle label="Signals" defaultChecked />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--brand),0.15)] shadow-[0_0_26px_rgba(0,128,255,0.45)]">
                <span className="absolute h-11 w-11 animate-[pulse_3s_ease-in-out_infinite] rounded-2xl bg-[radial-gradient(circle,_rgba(var(--brand-soft),0.65),_transparent_70%)] opacity-80" />
                <Brain className="relative size-5 text-brand" aria-hidden="true" />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex size-11 items-center justify-center rounded-full border border-[rgba(var(--border),0.45)] bg-[rgba(var(--panel),0.85)] text-[rgba(var(--subtle),0.8)] transition hover:rotate-3 hover:border-[rgba(var(--brand),0.65)] hover:text-[rgb(var(--text))]"
                aria-label="Close Command Center"
              >
                <X className="size-4" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
              <div className="space-y-4">
                {focusProject ? (
                  <article className="panel panel--glassy panel--alive panel--glow relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 p-5 text-[rgb(var(--text))]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[rgba(var(--subtle),0.7)]">
                          <ListChecks className="size-4 text-brand" /> Today&apos;s focus
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold">{focusProject.name}</h3>
                        <p className="mt-1 text-[rgba(var(--subtle),0.9)]">{focusProject.summary}</p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--brand),0.4)] bg-[rgba(var(--surface),0.85)] px-4 py-2 text-sm font-semibold text-brand shadow-[0_10px_30px_rgba(14,116,144,0.35)] transition hover:border-[rgba(var(--brand),0.8)] hover:text-[rgb(var(--text))]"
                      >
                        Jump in <ArrowRight className="size-4" />
                      </button>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-6 text-sm text-[rgba(var(--subtle),0.85)]">
                      <span className="inline-flex items-center gap-2">
                        <Activity className="size-4 text-brand" /> {focusProject.progress}% complete
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock className="size-4 text-brand" /> {focusProject.due}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="size-4 text-brand" /> {focusProject.milestones} milestones queued
                      </span>
                    </div>
                  </article>
                ) : null}

                <section className="panel panel--glassy rounded-3xl border border-white/10 bg-slate-900/85 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(var(--subtle),0.65)]">Projects</p>
                      <p className="text-sm text-[rgba(var(--subtle),0.85)]">Live streams from Workspace, Ops, and Research.</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--border),0.5)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(var(--subtle),0.8)] hover:border-[rgba(var(--brand),0.6)]"
                    >
                      View all <ArrowRight className="size-3" />
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {otherProjects.map((project) => (
                      <article
                        key={project.id}
                        className="panel panel--hover flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 transition"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(var(--subtle),0.6)]">
                              {project.owner}
                            </p>
                            <h4 className="text-lg font-semibold text-[rgb(var(--text))]">{project.name}</h4>
                          </div>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--border),0.45)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[rgba(var(--subtle),0.85)] hover:border-[rgba(var(--brand),0.7)]"
                          >
                            Jump in
                          </button>
                        </div>
                        <p className="text-sm text-[rgba(var(--subtle),0.85)]">{project.summary}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-[rgba(var(--subtle),0.75)]">
                          <span className="inline-flex items-center gap-1">
                            <Activity className="size-3" /> {project.progress}% progress
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" /> {project.due}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ListChecks className="size-3" /> {project.milestones} milestones
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <section className="panel panel--glassy rounded-3xl border border-white/10 bg-slate-900/85 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(var(--subtle),0.65)]">
                        <Clock className="size-3" /> Upcoming
                      </p>
                      <p className="text-sm text-[rgba(var(--subtle),0.85)]">Tasks queued up next for Workspace and Ops.</p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--brand),0.5)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand hover:border-[rgba(var(--brand),0.75)]"
                    >
                      Send to Workspace
                    </button>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {mockUpcoming.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-[rgb(var(--text))]">{item.title}</p>
                          <p className="text-xs text-[rgba(var(--subtle),0.75)]">{item.owner}</p>
                        </div>
                        <span className="text-xs font-semibold text-[rgba(var(--subtle),0.85)]">{item.eta}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="panel panel--glassy rounded-3xl border border-white/10 bg-slate-900/85 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(var(--subtle),0.65)]">
                    <Activity className="size-3" /> Signals
                  </div>
                  <div className="mt-3 space-y-3">
                    {mockSignals.map((signal) => (
                      <article
                        key={signal.id}
                        className="rounded-2xl border border-white/10 bg-slate-900/80 p-3"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[rgba(var(--subtle),0.65)]">
                          {signal.type}
                        </p>
                        <p className="text-sm font-semibold text-[rgb(var(--text))]">{signal.title}</p>
                        <p className="text-xs text-[rgba(var(--subtle),0.8)]">{signal.detail}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="panel panel--glassy rounded-3xl border border-white/10 bg-slate-900/85 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.32em] text-[rgba(var(--subtle),0.65)]">
                    <Network className="size-3" /> Connectors
                  </div>
                  <ul className="mt-3 space-y-2">
                    {mockConnectors.map((connector) => (
                      <li
                        key={connector.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2"
                      >
                        <div className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--text))]">
                          <span className="flex size-8 items-center justify-center rounded-2xl bg-slate-900/70">
                            <Link2 className="size-4 text-brand" />
                          </span>
                          <div>
                            <p>{connector.name}</p>
                            <p className="text-xs text-[rgba(var(--subtle),0.75)]">Last sync {connector.lastSync}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                            connector.status === "Live"
                              ? "bg-[rgba(var(--accent-emerald),0.15)] text-[rgb(var(--accent-emerald))]"
                              : connector.status === "Syncing"
                                ? "bg-[rgba(var(--brand-soft),0.2)] text-brand"
                                : "bg-[rgba(var(--status-critical),0.15)] text-[rgb(var(--status-critical))]"
                          }`}
                        >
                          {connector.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </main>

          <footer className="flex items-center justify-between gap-3 border-t border-[rgba(var(--border),0.35)] px-6 py-3 text-[11px] text-[rgba(var(--subtle),0.8)]">
            <div className="flex items-center gap-2">
              <GitBranch className="size-3.5 text-brand" />
              <span>
                Zora uses your settings, connectors, and engine ranking to keep this view relevant.
              </span>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--border),0.55)] bg-[rgba(var(--panel),0.9)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(var(--subtle),0.9)] hover:border-[rgba(var(--brand),0.6)] hover:text-[rgb(var(--text))]"
            >
              <Sparkles className="size-3" /> Customize in Settings
            </button>
          </footer>
        </section>
      </div>
    </div>
    </>
  );
}

type ModeToggleProps = {
  label: string;
  defaultChecked?: boolean;
};

function ModeToggle({ label, defaultChecked }: ModeToggleProps) {
  // TODO: Wire to settings.zora / settings.workspace / settings.commandCenter
  const [checked, setChecked] = React.useState(!!defaultChecked);

  return (
    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(var(--subtle),0.75)]">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={setChecked} aria-label={label} />
    </label>
  );
}
