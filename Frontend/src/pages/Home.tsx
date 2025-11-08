import { Link } from 'react-router-dom';
import { Play, Upload, LayoutTemplate, Settings as Cog } from 'lucide-react';

type QA = { icon: React.ComponentType<{className?: string}>; title: string; desc: string; cta: string; to: string; };

const quick: QA[] = [
  { icon: Play, title: 'New session', desc: 'Spin up an AI copilot session with curated prompts.', cta: 'Explore', to: '/chat' },
  { icon: Upload, title: 'Import transcript', desc: 'Bring existing chat history to continue.', cta: 'Explore', to: '/documents' },
  { icon: LayoutTemplate, title: 'Templates', desc: 'Start faster with Script-style frameworks.', cta: 'Explore', to: '/templates' },
  { icon: Cog, title: 'Settings', desc: 'Tweak providers, access, preferences.', cta: 'Explore', to: '/settings' }
];

function QuickCard({ icon: Icon, title, desc, cta, to }: QA) {
  return (
    <Link to={to} className="card p-6 hover-soft focus-ring block">
      <div className="size-10 rounded-xl bg-brand/10 grid place-items-center mb-3">
        <Icon className="size-5 text-brand" />
      </div>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-subtle mt-1">{desc}</div>
      <div className="text-sm text-brand mt-3">{cta} ↗</div>
    </Link>
  );
}

export function Home() {
  return (
    <div className="space-y-10">
      <section className="card relative overflow-hidden px-8 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center text-xs tracking-widest px-2 py-1 rounded-full bg-panel/70 border border-border/60">
            NEXUS BETA
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">Welcome to Nexus.ai</h1>
          <p className="mt-3 text-subtle">
            A scriptable command center where AI orchestration feels natural. Craft prompts, resume sessions,
            and manage provider intelligence within a polished workspace.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link to="/chat" className="h-10 px-4 rounded-xl bg-accent text-accent-foreground hover:shadow-glow focus-ring">Launch Console</Link>
            <Link to="/templates" className="h-10 px-4 rounded-xl border border-border/60 hover-soft focus-ring">Browse Templates</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {quick.map((q) => <QuickCard key={q.title} {...q} />)}
      </section>

      <section className="card p-0">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <div className="font-medium">Last 5 sessions</div>
          <Link to="/history" className="text-sm text-brand">View all sessions</Link>
        </div>
        <div className="divide-y divide-border/60">
          {['Growth strategy review', 'Product telemetry audit'].map((t, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{t}</div>
                <div className="text-xs text-subtle mt-0.5">2 hours ago</div>
              </div>
              <Link to="/history" className="h-8 px-3 rounded-lg bg-panel/70 border border-border/60 hover-soft focus-ring">Resume</Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
