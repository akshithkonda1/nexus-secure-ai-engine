import React from "react";
import { CalendarClock, FileText, Lightbulb, Plus, TrendingUp } from "lucide-react";

const featuredProjects = [
  {
    id: "alpha",
    name: "Summarize vNext",
    status: "Active",
    metric: "+12.4%",
    description: "Daily briefing flow trending above baseline",
  },
  {
    id: "beta",
    name: "Knowledge Vault",
    status: "Review",
    metric: "76 docs",
    description: "Awaiting compliance triage",
  },
];

const researchSignals = [
  {
    id: "rs-1",
    title: "Learning from tone shifts",
    summary: "Conversational sentiment improved after guardrail tuning.",
  },
  {
    id: "rs-2",
    title: "Voice mode beta",
    summary: "Acoustic embeddings reduced grounding time by 18%.",
  },
  {
    id: "rs-3",
    title: "Knowledge sync",
    summary: "Federated vector sync completed for legal and ops.",
  },
];

export function RightRail() {
  return (
    <aside className="hidden w-full max-w-xs flex-col gap-6 border-l border-[rgba(var(--border),0.6)] bg-white/60 px-6 pb-10 pt-8 text-[rgb(var(--text))] backdrop-blur-xl lg:flex xl:max-w-sm">
      <section className="rounded-3xl border border-[rgba(var(--border),0.8)] bg-white/80 p-5 shadow-[var(--shadow-soft)]">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">Projects</p>
            <h3 className="text-lg font-semibold">In motion</h3>
          </div>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-2xl bg-[rgba(var(--brand),0.12)] text-brand transition hover:bg-[rgba(var(--brand),0.2)]"
            aria-label="Create project"
          >
            <Plus className="size-4" />
          </button>
        </header>
        <ul className="mt-5 space-y-4">
          {featuredProjects.map((project) => (
            <li
              key={project.id}
              className="rounded-2xl border border-[rgba(var(--border),0.9)] bg-[rgba(var(--panel),0.6)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[rgb(var(--text))]">{project.name}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand),0.1)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand">
                  {project.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-[rgb(var(--subtle))]">{project.description}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-brand">
                <TrendingUp className="size-4" /> {project.metric}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-[rgba(var(--border),0.7)] bg-white/80 p-5 shadow-[var(--shadow-soft)]">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-[rgb(var(--subtle))]">
          <CalendarClock className="size-4" /> Upcoming
        </p>
        <div className="mt-4 space-y-3 text-sm text-[rgb(var(--text))]">
          <div className="rounded-2xl bg-[rgba(var(--panel),0.55)] p-3">
            <p className="font-medium">Roadmap sync</p>
            <p className="text-xs text-[rgb(var(--subtle))]">Tomorrow • 9:30am</p>
          </div>
          <div className="rounded-2xl bg-[rgba(var(--panel),0.55)] p-3">
            <p className="font-medium">Data retention review</p>
            <p className="text-xs text-[rgb(var(--subtle))]">Thu • 2:00pm</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[rgba(var(--border),0.6)] bg-white/90 p-5 shadow-[var(--shadow-soft)]">
        <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-[rgb(var(--subtle))]">
          <Lightbulb className="size-4 text-brand" /> Research signals
        </header>
        <ul className="mt-4 space-y-3 text-sm">
          {researchSignals.map((signal) => (
            <li key={signal.id} className="rounded-2xl bg-[rgba(var(--panel),0.55)] p-3">
              <p className="font-semibold text-[rgb(var(--text))]">{signal.title}</p>
              <p className="text-xs text-[rgb(var(--subtle))]">{signal.summary}</p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(var(--border),0.9)] bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-[rgba(var(--panel),0.65)]"
        >
          <FileText className="size-4" /> View updates
        </button>
      </section>
    </aside>
  );
}
