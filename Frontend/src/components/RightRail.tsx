import React from "react";
import {
  CalendarClock,
  FileText,
  Lightbulb,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  requestDocumentsView,
  requestProjectCreation,
  requestProjectOpen,
} from "@/lib/actions";

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

function projectStatusTone(status: string) {
  if (status === "Active") return "chip chip--ok";
  if (status === "Review") return "chip chip--warn";
  return "chip";
}

export function RightRail() {
  const navigate = useNavigate();

  return (
    <aside className="hidden w-full max-w-xs flex-col gap-6 border-l border-neutral-200/80 bg-white/85 px-6 pb-10 pt-8 text-[rgb(var(--text))] backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-900/85 lg:flex xl:max-w-sm">
      <section className="relative rounded-3xl border border-neutral-300/50 bg-white/85 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
              Projects
            </p>
            <h3 className="accent-ink text-lg font-semibold">In motion</h3>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-neo ripple size-9 rounded-full p-0"
            aria-label="Create project"
            onClick={() => requestProjectCreation()}
          >
            <Plus className="size-4" />
          </button>
        </header>
        <ul className="mt-5 space-y-4">
          {featuredProjects.map((project) => (
            <li
              key={project.id}
              className="relative rounded-2xl border border-neutral-300/50 bg-white/85 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] dark:border-neutral-700/50 dark:bg-neutral-900/85"
              role="button"
              tabIndex={0}
              onClick={() => {
                requestProjectOpen(project.id);
                navigate(`/home?project=${project.id}`);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  requestProjectOpen(project.id);
                  navigate(`/home?project=${project.id}`);
                }
              }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[rgb(var(--text))]">
                  {project.name}
                </span>
                <span
                  className={`${projectStatusTone(project.status)} text-[10px] uppercase tracking-[0.24em]`}
                >
                  {project.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-[rgb(var(--subtle))]">
                {project.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-brand">
                <TrendingUp className="size-4" /> {project.metric}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative rounded-3xl border border-neutral-300/50 bg-white/85 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-[rgb(var(--subtle))]">
          <CalendarClock className="size-4" /> Upcoming
        </p>
        <div className="mt-4 space-y-3 text-sm text-[rgb(var(--text))]">
          <div className="relative rounded-2xl border border-neutral-300/50 bg-white/85 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85">
            <p className="font-medium">Roadmap sync</p>
            <p className="text-xs text-[rgb(var(--subtle))]">
              Tomorrow • 9:30am
            </p>
          </div>
          <div className="relative rounded-2xl border border-neutral-300/50 bg-white/85 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85">
            <p className="font-medium">Data retention review</p>
            <p className="text-xs text-[rgb(var(--subtle))]">Thu • 2:00pm</p>
          </div>
        </div>
      </section>

      <section className="relative rounded-3xl border border-neutral-300/50 bg-white/85 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85">
        <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-[rgb(var(--subtle))]">
          <Lightbulb className="size-4 text-brand" /> Research signals
        </header>
        <ul className="mt-4 space-y-3 text-sm">
          {researchSignals.map((signal) => (
            <li
              key={signal.id}
              className="relative rounded-2xl border border-neutral-300/50 bg-white/85 p-3 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85"
            >
              <p className="font-semibold text-[rgb(var(--text))]">
                {signal.title}
              </p>
              <p className="text-xs text-[rgb(var(--subtle))]">
                {signal.summary}
              </p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-5 btn btn-ghost btn-neo btn-quiet w-full justify-center rounded-2xl text-brand"
          onClick={() => {
            requestDocumentsView("updates");
            navigate("/documents");
          }}
        >
          <FileText className="size-4" /> View updates
        </button>
      </section>
    </aside>
  );
}
