import { MessageCircle, Upload, Sparkles, Settings as Gear } from "lucide-react";

function Quick({ Icon, title, desc }: { Icon: any; title: string; desc: string }) {
  return (
    <div className="card p-5 hover:shadow-glow transition">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[var(--nexus-accent)]/12 border border-[var(--nexus-accent)]/30">
          <Icon className="h-5 w-5 text-[var(--nexus-accent)]" />
        </div>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm opacity-70">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function Session({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card p-4 flex items-start justify-between">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm opacity-70">{desc}</div>
      </div>
      <button className="text-sm border">Resume</button>
    </div>
  );
}

export function Home() {
  return (
    <div className="container-page pt-20 pl-64">
      <h1 className="text-2xl font-semibold mb-4">Welcome to Nexus.ai</h1>
      <p className="opacity-80 mb-6">
        Orchestrate trusted AI debate sessions, audit every decision, and keep tabs on telemetry in one place.
      </p>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Quick Icon={MessageCircle} title="New session" desc="Launch a fresh multi-model debate." />
        <Quick Icon={Upload}         title="Import transcript" desc="Upload past debates for instant auditing." />
        <Quick Icon={Sparkles}       title="Templates" desc="Kick off trust-first workflows in seconds." />
        <Quick Icon={Gear}           title="Settings"  desc="Tune guardrails, quotas, and providers." />
      </div>

      <h2 className="section-title">Last 5 sessions</h2>
      <div className="space-y-3">
        <Session title="Market intelligence thread 6" desc="Exploring Spurs-inspired refinements." />
        <Session title="Partner enablement thread 12" desc="Mapping telemetry for review workflows." />
      </div>
    </div>
  );
}
