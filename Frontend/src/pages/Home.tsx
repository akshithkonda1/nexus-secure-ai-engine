import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, ShieldCheck, FileSpreadsheet, Activity, RefreshCw } from "lucide-react";
import { useDebateStore } from "@/stores/debateStore";

const PROJECT_BATCH = 4;
const DRAFT_STORAGE_KEY = "nexus.dashboard.draft";

type Project = {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
};

type QuickAction = {
  title: string;
  description: string;
  icon: JSX.Element;
  accent: string;
  onClick: () => void;
};

const skeletonCards = new Array(PROJECT_BATCH).fill(null);

export default function Home() {
  const navigate = useNavigate();
  const setQuery = useDebateStore((state) => state.setQuery);
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.localStorage.getItem(DRAFT_STORAGE_KEY) ?? "";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(DRAFT_STORAGE_KEY, draft);
  }, [draft]);

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 450));
      if (!active) return;
      const startIndex = page * PROJECT_BATCH;
      const generated = Array.from({ length: PROJECT_BATCH }, (_, index) => {
        const id = startIndex + index + 1;
        return {
          id: `project-${id}`,
          title: `Trust Review ${id.toString().padStart(2, "0")}`,
          description: "Consensus transcripts, guardrail coverage, and anomaly detections from the latest debates.",
          updatedAt: new Date(Date.now() - id * 3600 * 1000).toLocaleString(),
        } satisfies Project;
      });
      setProjects((prev) => [...prev, ...generated]);
      setLoading(false);
    };
    void loadProjects();
    return () => {
      active = false;
    };
  }, [page]);

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        title: "Start Debate",
        description: "Launch a fresh multi-model debate with a single tap.",
        icon: <Users className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-trustBlue text-white",
        onClick: () => {
          setQuery("");
          navigate("/chat");
        },
      },
      {
        title: "Validate Output",
        description: "Verify claims and citations across competing models.",
        icon: <ShieldCheck className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-white/10 text-trustBlue",
        onClick: () => navigate("/templates"),
      },
      {
        title: "Generate Report",
        description: "Summarize consensus, dissent, and risk signals in one click.",
        icon: <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-white/10 text-trustBlue",
        onClick: () => navigate("/documents"),
      },
      {
        title: "View Telemetry",
        description: "Inspect response scores and guardrail coverage metrics.",
        icon: <Activity className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-white/10 text-trustBlue",
        onClick: () => navigate("/telemetry"),
      },
    ],
    [navigate, setQuery],
  );

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 text-white shadow-2xl"
      >
        <p className="text-sm uppercase tracking-[0.25em] text-blue/70">Beta</p>
        <h1 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
          Welcome to Nexus.ai – Orchestrating Trust in AI
        </h1>
        <p className="mt-4 max-w-2xl text-base text-silver/80">
          Spin up model debates, audit every citation, and log telemetry automatically. Nexus.ai keeps your AI stack honest and compliant.
        </p>
      </motion.section>

      <section aria-labelledby="quick-actions">
        <div className="flex items-center justify-between gap-4">
          <h2 id="quick-actions" className="text-lg font-semibold text-white">
            Quick actions
          </h2>
          <p className="text-xs text-silver/60">Optimized for <span className="text-trustBlue">sub-second</span> launch.</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.title}
              type="button"
              onClick={action.onClick}
              whileHover={{ y: -4 }}
              whileFocus={{ y: -2 }}
              className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-black/60 p-5 text-left text-silver shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.accent}`}>
                {action.icon}
              </span>
              <div>
                <p className="text-base font-semibold text-white">{action.title}</p>
                <p className="mt-2 text-sm text-silver/70">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <section aria-labelledby="draft-guardrail" className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="rounded-3xl border border-white/10 bg-black/70 p-6 shadow-lg">
          <h2 id="draft-guardrail" className="text-lg font-semibold text-white">
            Offline draft
          </h2>
          <p className="mt-2 text-sm text-silver/70">
            Capture guardrail ideas offline. We sync locally in your browser so nothing gets lost.
          </p>
          <label htmlFor="draft" className="sr-only">
            Draft guardrail notes
          </label>
          <textarea
            id="draft"
            name="draft"
            rows={6}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-silver placeholder:text-silver/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
            placeholder="Outline the guardrails, evaluation data, or follow-ups you want to track."
          />
          <p className="mt-3 text-xs text-silver/60">Autosaved locally – clear anytime via browser storage.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/70 p-6 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Recent projects</h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-silver transition hover:border-trustBlue/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={loading}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Load more
            </button>
          </div>
          <div className="mt-4 space-y-4" aria-live="polite">
            {projects.map((project) => (
              <motion.article
                key={project.id}
                layout
                className="rounded-2xl border border-white/10 bg-black/60 p-4 shadow"
              >
                <p className="text-sm font-semibold text-white">{project.title}</p>
                <p className="mt-2 text-xs text-silver/70">{project.description}</p>
                <p className="mt-3 text-xs text-silver/60">Updated {project.updatedAt}</p>
              </motion.article>
            ))}
            {loading
              ? skeletonCards.map((_, index) => (
                  <div key={`skeleton-${index.toString()}`} className="animate-pulse rounded-2xl border border-white/5 bg-black/30 p-4">
                    <div className="h-4 w-1/3 rounded bg-white/10" />
                    <div className="mt-3 h-3 w-2/3 rounded bg-white/5" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-white/5" />
                  </div>
                ))
              : null}
            {!loading && projects.length === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-6 text-sm text-silver/60">
                No projects yet. Quick actions above can help you create your first timeline.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-black/80 p-6 text-silver/80 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">Telemetry snapshot</h2>
        <p className="mt-3 text-sm">
          Nexus.ai tracks consensus strength, dissent ratios, and flagged content in real time. Hook your analytics pipeline into the telemetry endpoint to enrich governance dashboards.
        </p>
      </section>
    </div>
  );
}
