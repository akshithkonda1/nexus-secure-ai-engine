import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, FileText, MessageSquare, Settings as SettingsIcon, Upload } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { QuickAction } from "@/components/QuickAction";
import { useProjects, useSessions } from "@/queries/sessions";
import type { Project, Session } from "@/types/models";

const QUICK_ACTIONS = [
  {
    label: "New session",
    description: "Launch a fresh multi-model debate.",
    icon: MessageSquare,
    to: "/chat",
  },
  {
    label: "Import transcript",
    description: "Upload past debates for instant auditing.",
    icon: Upload,
    to: "/documents",
  },
  {
    label: "Templates",
    description: "Kick off trust-first workflows in seconds.",
    icon: FileText,
    to: "/templates",
  },
  {
    label: "Settings",
    description: "Tune guardrails, quotas, and providers.",
    icon: SettingsIcon,
    to: "/settings",
  },
] as const;

const EMPTY_SESSIONS: Session[] = [];
const EMPTY_PROJECTS: Project[] = [];

export default function Home() {
  const navigate = useNavigate();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const { data: projectsData, isLoading: projectsLoading } = useProjects();

  const sessions = sessionsData?.sessions ?? EMPTY_SESSIONS;
  const projects = projectsData?.projects ?? EMPTY_PROJECTS;

  const lastFive = useMemo(() => sessions.slice(0, 5), [sessions]);
  const totalMessages = useMemo(() => sessions.reduce((acc, session) => acc + session.messages, 0), [sessions]);

  return (
    <div className="space-y-10 text-white">
      <PageHeader
        title="Welcome to Nexus.ai"
        description="Orchestrate trusted AI debate sessions, audit every decision, and keep tabs on telemetry in one place."
        actions={
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Start session
          </button>
        }
      />

      <section>
        <h2 className="text-lg font-semibold text-white">Quick actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <motion.div key={action.label} whileHover={{ y: -4 }}>
              <QuickAction
                icon={action.icon}
                title={action.label}
                desc={action.description}
                onClick={() => navigate(action.to)}
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-4 rounded-xl border border-white/10 bg-elevated/80 p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Last 5 sessions</h2>
            <button
              type="button"
              onClick={() => navigate("/sessions")}
              className="text-xs font-semibold text-muted underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              View all
            </button>
          </div>
          {sessionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 bg-white/5" />
              ))}
            </div>
          ) : lastFive.length ? (
            <ul className="space-y-3">
              {lastFive.map((session) => (
                <li key={session.id} className="rounded-lg border border-white/5 bg-surface/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{session.title}</p>
                      <p className="mt-1 text-xs text-muted">{session.preview ?? "Trusted debate ready to resume."}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/chat/${session.id}`)}
                      className="inline-flex items-center gap-2 rounded-lg border border-primary/60 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Resume
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No sessions yet"
              description="Launch your first debate to see it here."
              action={
                <button
                  type="button"
                  onClick={() => navigate("/chat")}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow"
                >
                  Start session
                </button>
              }
            />
          )}
        </div>

        <div className="grid gap-6">
          <div className="rounded-xl border border-white/10 bg-elevated/80 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-white">Projects snapshot</h2>
            {projectsLoading ? (
              <Skeleton className="mt-4 h-32 bg-white/5" />
            ) : projects.length ? (
              <div className="mt-4 space-y-3 text-sm text-muted">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-surface/60 px-4 py-3">
                    <div>
                      <p className="font-semibold text-white">{project.name}</p>
                      <p className="text-xs text-muted">{project.sessionsCount} sessions · {project.activeCount} active</p>
                    </div>
                    <span className="text-xs text-muted">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No projects"
                description="Organize sessions into shared workstreams to populate this view."
              />
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-elevated/80 p-6 shadow-card">
            <h2 className="text-lg font-semibold text-white">Usage today</h2>
            {sessionsLoading ? (
              <Skeleton className="mt-4 h-32 bg-white/5" />
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-white/5 bg-surface/70 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Sessions</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{sessions.length}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-surface/70 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Messages</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{totalMessages}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-surface/70 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">Providers</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {Array.from(new Set(sessions.flatMap((session) => session.providers))).length}
                  </p>
                </div>
              </div>
            )}
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Activity className="h-4 w-4" aria-hidden="true" /> Numbers refresh automatically from the Nexus telemetry mock API.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
