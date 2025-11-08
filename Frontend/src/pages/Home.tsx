import { MessageSquare, Upload, Sparkles, Settings as SettingsIcon } from 'lucide-react';

function QuickAction({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="card p-6 flex items-center gap-4 transition-all hover:shadow-glow">
      <div className="p-3 rounded-lg" style={{ background: 'rgba(37,99,235,0.1)' }}>
        <Icon className="w-6 h-6" style={{ color: 'var(--nexus-accent)' }} />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm opacity-75">{desc}</p>
      </div>
    </div>
  );
}

export function Home() {
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction icon={MessageSquare} title="New session" desc="Launch a fresh multi-model debate." />
        <QuickAction icon={Upload} title="Import transcript" desc="Upload past debates for auditing." />
        <QuickAction icon={Sparkles} title="Templates" desc="Start with trust-first workflows." />
        <QuickAction icon={SettingsIcon} title="Settings" desc="Tune guardrails & providers." />
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Recent sessions</h2>
        <div className="card p-4 flex justify-between items-start">
          <div>
            <h4 className="font-medium">Market Intelligence thread 6</h4>
            <p className="text-sm opacity-75">Exploring Spurs-inspired UI refinements for Nexus debates.</p>
          </div>
          <button className="text-sm" style={{ color: 'var(--nexus-accent)' }}>
            Resume
          </button>
        </div>
        <div className="card p-4 flex justify-between items-start">
          <div>
            <h4 className="font-medium">Partner Enablement thread 12</h4>
            <p className="text-sm opacity-75">Provider weighting + bias gating.</p>
          </div>
          <button className="text-sm" style={{ color: 'var(--nexus-accent)' }}>
            Resume
          </button>
        </div>
      </section>
    </div>
  );
}
