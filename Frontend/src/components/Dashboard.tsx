import { Cog, FileText, MessageSquare, Upload } from "lucide-react";

import { QuickAction } from "@/components/QuickAction";
import { SessionItem } from "@/components/SessionItem";
import { SettingsPanel } from "@/components/SettingsPanel";

const ACTIONS = [
  {
    icon: MessageSquare,
    title: "New session",
    desc: "Launch a fresh multi-model debate.",
  },
  {
    icon: Upload,
    title: "Import transcript",
    desc: "Upload past debates for instant auditing.",
  },
  {
    icon: FileText,
    title: "Kick off trust-first",
    desc: "Spin up workflows in seconds.",
  },
  {
    icon: Cog,
    title: "Settings",
    desc: "Tune guardrails, quotas, and providers.",
  },
] as const;

const RECENT_SESSIONS = [
  {
    title: "Market intelligence thread 6",
    desc: "Exploring Spurs-inspired UI refinements for Nexus debates.",
  },
  {
    title: "Partner enablement thread 12",
    desc: "Mapping telemetry for stakeholder review workflows.",
  },
];

export function Dashboard() {
  return (
    <div className="space-y-10 text-white">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome to Nexus.ai</h2>
        <p className="max-w-2xl text-sm text-muted sm:text-base">
          Orchestrate trusted AI debate sessions, audit every decision, and keep tabs on telemetry in one place.
        </p>
      </header>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Quick actions</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ACTIONS.map((action) => (
            <QuickAction key={action.title} icon={action.icon} title={action.title} desc={action.desc} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-elevated/70 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold">Last 5 sessions</h3>
            <button
              type="button"
              className="text-xs font-semibold text-muted transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {RECENT_SESSIONS.map((session) => (
              <SessionItem key={session.title} title={session.title} desc={session.desc} onResume={() => undefined} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-elevated/70 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.35)]">
          <SettingsPanel />
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
