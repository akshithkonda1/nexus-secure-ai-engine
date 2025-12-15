import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Briefcase } from "lucide-react";

const recent = [
  { title: "Workspace", description: "Updated research outline" },
  { title: "Toron", description: "Shared summary with team" },
  { title: "Settings", description: "Adjusted appearance" },
];

export default function HomePage() {
  return (
    <section className="flex flex-col gap-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.08em] text-[var(--text-muted)]">Welcome</p>
        <h1 className="text-3xl font-semibold text-[var(--text-strong)]">Calm control for your workspace</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          Move between Toron, project work, and settings without friction. Everything uses one quiet, consistent shell.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          to="/toron"
          className="group flex items-center justify-between rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-5 py-6 text-[var(--text-primary)] transition hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-surface)]">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <div className="text-lg font-semibold">Toron</div>
              <p className="text-sm text-[var(--text-muted)]">Focused, neutral chat interface.</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-[var(--text-muted)] transition group-hover:text-[var(--text-strong)]" aria-hidden />
        </Link>

        <Link
          to="/workspace"
          className="group flex items-center justify-between rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-5 py-6 text-[var(--text-primary)] transition hover:border-[var(--line-strong)] hover:text-[var(--text-strong)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-surface)]">
              <Briefcase className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <div className="text-lg font-semibold">Workspace</div>
              <p className="text-sm text-[var(--text-muted)]">Structured projects without clutter.</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-[var(--text-muted)] transition group-hover:text-[var(--text-strong)]" aria-hidden />
        </Link>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-semibold text-[var(--text-strong)]">Recent activity</div>
        <div className="divide-y divide-[var(--line-subtle)] rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-muted)]">
          {recent.map((item) => (
            <div key={item.title} className="flex items-center justify-between px-5 py-4 text-sm">
              <div>
                <div className="font-medium text-[var(--text-primary)]">{item.title}</div>
                <p className="text-[var(--text-muted)]">{item.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
