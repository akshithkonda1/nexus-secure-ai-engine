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
        accent: "bg-app-text/10 text-trustBlue",
        onClick: () => navigate("/templates"),
      },
      {
        title: "Generate Report",
        description: "Summarize consensus, dissent, and risk signals in one click.",
        icon: <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-app-text/10 text-trustBlue",
        onClick: () => navigate("/documents"),
      },
      {
        title: "View Telemetry",
        description: "Inspect response scores and guardrail coverage metrics.",
        icon: <Activity className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-app-text/10 text-trustBlue",
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
        className="rounded-3xl border border-app bg-panel p-8 text-ink shadow-2xl"
      >
        <h1 className="mt-4 text-3xl font-semibold text-ink md:text-4xl">
          Welcome to Nexus.ai – Orchestrating Trust in AI
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted">
          Spin up model debates, audit every citation, and log telemetry automatically. Nexus.ai keeps your AI stack Honest and Accurate, making sure you get the right data when you need it.
        </p>
      </motion.section>

      <section aria-labelledby="quick-actions">
        <div className="flex items-center justify-between gap-4">
          <h2 id="quick-actions" className="text-lg font-semibold text-ink">
            Quick actions
          </h2>
          <p className="text-xs text-muted">Optimized for <span className="text-trustBlue">sub-second</span> launch.</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.title}
              type="button"
              onClick={action.onClick}
              whileHover={{ y: -4 }}
              whileFocus={{ y: -2 }}
              className="flex h-full flex-col gap-4 rounded-2xl border border-app bg-panel p-5 text-left text-muted shadow-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.accent}`}>
                {action.icon}
              </span>
              <div>
                <p className="text-base font-semibold text-ink">{action.title}</p>
                <p className="mt-2 text-sm text-muted">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <section aria-labelledby="draft-guardrail" className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="rounded-3xl border border-app bg-panel p-6 shadow-lg">
          <h2 id="draft-guardrail" className="text-lg font-semibold text-ink">
            Offline draft
          </h2>
          <p className="mt-2 text-sm text-muted">
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
            className="mt-4 w-full resize-none rounded-2xl border border-app bg-panel p-4 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
            placeholder="Outline the guardrails, evaluation data, or follow-ups you want to track."
          />
          <p className="mt-3 text-xs text-muted">Autosaved locally – clear anytime via browser storage.</p>
        </div>
        <div className="rounded-3xl border border-app bg-panel p-6 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink">Recent projects</h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-app px-3 py-1 text-xs font-medium text-muted transition hover:border-trustBlue/60 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg disabled:cursor-not-allowed disabled:opacity-50"
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
                className="rounded-2xl border border-app bg-panel p-4 shadow"
              >
                <p className="text-sm font-semibold text-ink">{project.title}</p>
                <p className="mt-2 text-xs text-muted">{project.description}</p>
                <p className="mt-3 text-xs text-muted">Updated {project.updatedAt}</p>
              </motion.article>
            ))}
            {loading
              ? skeletonCards.map((_, index) => (
                  <div key={`skeleton-${index.toString()}`} className="animate-pulse rounded-2xl border border-app/40 bg-app px-4 py-4">
                    <div className="h-4 w-1/3 rounded bg-app-text/20" />
                    <div className="mt-3 h-3 w-2/3 rounded bg-app-text/10" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-app-text/10" />
                  </div>
                ))
              : null}
            {!loading && projects.length === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-app bg-panel p-6 text-sm text-muted">
                No projects yet. Quick actions above can help you create your first timeline.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-app bg-panel p-6 text-muted shadow-2xl">
        <h2 className="text-lg font-semibold text-ink">Telemetry snapshot</h2>
        <p className="mt-3 text-sm">
          Nexus.ai tracks consensus strength, dissent ratios, and flagged content in real time. Hook your analytics pipeline into the telemetry endpoint to enrich governance dashboards.
        </p>
      </section>
    </div>
  );
}
