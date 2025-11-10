import React from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, UploadCloud, Sparkles, Settings2 } from "lucide-react";

type QuickAction = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  to: string;
};

const quickActions: QuickAction[] = [
  { label: "New Session", icon: PlayCircle, to: "/chat" },
  { label: "Import Transcript", icon: UploadCloud, to: "/documents" },
  { label: "Browse Templates", icon: Sparkles, to: "/templates" },
  { label: "Adjust Settings", icon: Settings2, to: "/settings" },
];

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8 text-[rgb(var(--text))]">
      <section className="rounded-3xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] px-10 py-12 shadow-[var(--elev-1)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Nexus • Beta
            </span>
            <h1 className="text-4xl font-semibold leading-tight">
              Operate your AI workflows with clarity and control.
            </h1>
            <p className="max-w-xl text-sm text-[rgb(var(--subtle))]">
              Launch multi-agent sessions, reuse curated templates, and keep every document and decision within reach.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white shadow-[var(--elev-1)] transition hover:shadow-[var(--elev-2)]"
              >
                Launch console
              </button>
              <button
                type="button"
                onClick={() => navigate("/templates")}
                className="rounded-full border border-[color:rgba(var(--border))] px-6 py-2 text-sm font-semibold transition hover:bg-[rgb(var(--panel))]"
              >
                Explore templates
              </button>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl bg-brand/10 p-6 text-brand shadow-inner">
            <p className="text-sm font-medium uppercase tracking-[0.24em]">Telemetry Snapshot</p>
            <dl className="grid grid-cols-2 gap-4 text-sm text-[rgb(var(--text))]">
              <div>
                <dt className="text-[rgb(var(--subtle))]">Active sessions</dt>
                <dd className="text-2xl font-semibold">5</dd>
              </div>
              <div>
                <dt className="text-[rgb(var(--subtle))]">Templates used</dt>
                <dd className="text-2xl font-semibold">12</dd>
              </div>
              <div>
                <dt className="text-[rgb(var(--subtle))]">Documents indexed</dt>
                <dd className="text-2xl font-semibold">248</dd>
              </div>
              <div>
                <dt className="text-[rgb(var(--subtle))]">Avg. satisfaction</dt>
                <dd className="text-2xl font-semibold">94%</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ label, icon: Icon, to }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(to)}
            className="flex items-center gap-4 rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] px-5 py-4 text-left shadow-[var(--elev-1)] transition hover:-translate-y-0.5 hover:shadow-[var(--elev-2)]"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">{label}</span>
          </button>
        ))}
      </section>

      <section className="grid gap-4 rounded-3xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-[var(--elev-1)]">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent sessions</h2>
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="text-sm font-medium text-brand hover:underline"
          >
            View history
          </button>
        </header>
        <ul className="space-y-3 text-sm">
          {["Growth strategy review", "Partner enablement thread", "Telemetry QA sync"].map((session) => (
            <li key={session} className="flex items-center justify-between rounded-2xl bg-[rgb(var(--panel))] px-4 py-3">
              <span className="font-medium">{session}</span>
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="rounded-full border border-[color:rgba(var(--border))] px-4 py-1 text-xs font-semibold transition hover:bg-[rgb(var(--surface))]"
              >
                Resume
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Home;
