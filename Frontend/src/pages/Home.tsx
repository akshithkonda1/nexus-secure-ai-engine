import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Activity, FileSpreadsheet, RefreshCw, ShieldCheck, Users } from "lucide-react";
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
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const hasBootstrappedRef = useRef(false);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

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
      await new Promise((resolve) => setTimeout(resolve, 360));
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
      setProjects((prev) => {
        const next = [...prev, ...generated];
        if (!hasBootstrappedRef.current) {
          hasBootstrappedRef.current = true;
        }
        return next;
      });
      setLoading(false);
    };
    void loadProjects();
    return () => {
      active = false;
    };
  }, [page]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasBootstrappedRef.current && !loadingRef.current) {
            setPage((prev) => prev + 1);
          }
        });
      },
      { rootMargin: "240px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [projects.length]);

  const handleStartDebate = useCallback(() => {
    setQuery("");
    navigate("/chat");
  }, [navigate, setQuery]);

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        title: "Start Debate",
        description: "Launch a fresh multi-model debate with a single tap.",
        icon: <Users className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-trustBlue text-white",
        onClick: handleStartDebate,
      },
      {
        title: "Validate Output",
        description: "Verify claims and citations across competing models.",
        icon: <ShieldCheck className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-[color:var(--surface-elevated)] text-trustBlue",
        onClick: () => navigate("/templates"),
      },
      {
        title: "Generate Report",
        description: "Summarize consensus, dissent, and risk signals in one click.",
        icon: <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-[color:var(--surface-elevated)] text-trustBlue",
        onClick: () => navigate("/documents"),
      },
      {
        title: "View Telemetry",
        description: "Inspect response scores and guardrail coverage metrics.",
        icon: <Activity className="h-6 w-6" aria-hidden="true" />,
        accent: "bg-[color:var(--surface-elevated)] text-trustBlue",
        onClick: () => navigate("/telemetry"),
      },
    ],
    [handleStartDebate, navigate],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-app-border bg-[color:var(--surface-elevated)] p-8 text-app-text shadow-card"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-silver">Dynasty Edition</p>
        <h1 className="mt-4 text-3xl font-semibold text-silver md:text-4xl">
          Welcome to Nexus.ai – Orchestrating Trust in AI
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-app-text opacity-80">
          Spin up model debates, audit every citation, and log telemetry automatically. Nexus.ai keeps your AI stack honest and
          compliant with Spurs-level discipline.
        </p>
      </motion.section>

      <section aria-labelledby="quick-actions" className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 id="quick-actions" className="text-lg font-semibold text-silver">
            Quick actions
          </h2>
          <p className="text-xs text-app-text opacity-70">Optimized for <span className="text-trustBlue">sub-second</span> launch.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.title}
              type="button"
              onClick={action.onClick}
              whileHover={{ y: -6 }}
              whileFocus={{ y: -3 }}
              className="flex h-full flex-col gap-4 rounded-2xl border border-app-border bg-surface p-5 text-left text-app-text shadow-card transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)]"
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.accent}`}>{action.icon}</span>
              <div>
                <p className="text-base font-semibold text-silver">{action.title}</p>
                <p className="mt-2 text-sm text-app-text opacity-70">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <section aria-labelledby="draft-and-projects" className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="rounded-3xl border border-app-border bg-surface p-6 shadow-card">
          <h2 id="draft-and-projects" className="text-lg font-semibold text-silver">
            Offline draft
          </h2>
          <p className="mt-2 text-sm text-app-text opacity-70">
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
            className="mt-4 w-full resize-none rounded-2xl border border-app-border bg-[color:var(--surface-elevated)] p-4 text-sm text-app-text placeholder:text-app-text placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue"
            placeholder="Outline the guardrails, evaluation data, or follow-ups you want to track."
          />
          <p className="mt-3 text-xs text-app-text opacity-60">Autosaved locally – clear anytime via browser storage.</p>
        </div>
        <div className="rounded-3xl border border-app-border bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-silver">Recent projects</h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-app-border px-3 py-1 text-xs font-medium text-app-text transition hover:border-trustBlue/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                if (!loading) {
                  setPage((prev) => prev + 1);
                }
              }}
              disabled={loading}
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Load more
            </button>
          </div>
          <div className="mt-4 space-y-4" aria-live="polite">
            <AnimatePresence initial={false}>
              {projects.map((project) => (
                <motion.article
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-2xl border border-app-border bg-[color:var(--surface-elevated)] p-4 text-app-text shadow-sm"
                >
                  <p className="text-sm font-semibold text-silver">{project.title}</p>
                  <p className="mt-2 text-xs text-app-text opacity-70">{project.description}</p>
                  <p className="mt-3 text-xs text-app-text opacity-60">Updated {project.updatedAt}</p>
                </motion.article>
              ))}
            </AnimatePresence>
            {loading
              ? skeletonCards.map((_, index) => (
                  <div key={`skeleton-${index.toString()}`} className="animate-pulse rounded-2xl border border-app-border bg-[color:var(--surface-elevated)] p-4">
                    <div className="h-4 w-1/3 rounded bg-silver/20" />
                    <div className="mt-3 h-3 w-2/3 rounded bg-silver/10" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-silver/10" />
                  </div>
                ))
              : null}
            {!loading && projects.length === 0 ? (
              <div className="flex items-center justify-center rounded-2xl border border-app-border bg-[color:var(--surface-elevated)] p-6 text-sm text-app-text opacity-70">
                No projects yet. Quick actions above can help you create your first timeline.
              </div>
            ) : null}
            <div ref={sentinelRef} aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-app-border bg-surface p-6 text-app-text opacity-80 shadow-card">
        <h2 className="text-lg font-semibold text-silver">Telemetry snapshot</h2>
        <p className="mt-3 text-sm">
          Nexus.ai tracks consensus strength, dissent ratios, and flagged content in real time. Hook your analytics pipeline into
          the telemetry endpoint to enrich governance dashboards.
        </p>
      </section>
    </div>
  );
}
