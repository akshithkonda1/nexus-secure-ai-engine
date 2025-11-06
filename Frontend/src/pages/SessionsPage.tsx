import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Archive,
  Clock,
  Filter,
  Folder,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Play,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useAudit, useProjects, useSessions } from "@/queries/sessions";
import type { AuditEvent, Project, Session } from "@/types/models";

const TOP_N = 20;

const EMPTY_SESSIONS: Session[] = [];
const EMPTY_PROJECTS: Project[] = [];
const EMPTY_AUDIT_EVENTS: AuditEvent[] = [];

function fmtRelative(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

function groupEventsByDate(events: AuditEvent[]) {
  const map = new Map<string, AuditEvent[]>();
  events.forEach((event) => {
    const key = new Date(event.at).toDateString();
    const arr = map.get(key) ?? [];
    arr.push(event);
    map.set(key, arr);
  });
  return Array.from(map.entries()).map(([label, items]) => ({
    label,
    items: items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
  }));
}

function SessionCard({ session }: { session: Session }) {
  const navigate = useNavigate();
  return (
    <motion.article
      layout
      className="group flex flex-col justify-between rounded-3xl border border-app bg-panel p-5 text-ink shadow-lg transition hover:-translate-y-1 hover:border-trustBlue/60 hover:shadow-2xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">{session.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{session.preview ?? "Kick off a fresh Nexus debate."}</p>
        </div>
        {session.pinned ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-trustBlue/40 bg-trustBlue/10 px-3 py-1 text-xs font-medium text-trustBlue">
            <Pin className="h-3 w-3" aria-hidden="true" /> Pinned
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {fmtRelative(session.updatedAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> {session.messages} messages
        </span>
        {session.providers.length ? (
          <span className="inline-flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" /> {session.providers.join(", ")}
          </span>
        ) : null}
        <span className="ml-auto inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-widest">
          {session.status}
        </span>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(`/chat/${session.id}`)}
          className="inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
        >
          <Play className="h-4 w-4" aria-hidden="true" /> Continue
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-app px-3 py-1.5 text-xs font-medium text-muted transition hover:border-trustBlue/60 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" /> Manage
        </button>
      </div>
    </motion.article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-app bg-panel p-5 text-ink shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">{project.name}</h3>
          <p className="mt-2 text-sm text-muted">{project.description ?? "Trusted workspace"}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-trustBlue/10 text-trustBlue">
          <Folder className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        <span>{project.sessionsCount} sessions</span>
        <span>{project.activeCount} active</span>
        <span>Updated {fmtRelative(project.updatedAt)}</span>
      </div>
      {project.activity7d ? (
        <div className="mt-4 h-16 rounded-2xl bg-app/60" aria-hidden="true">
          <div className="flex h-full w-full items-end justify-between gap-1 px-2">
            {project.activity7d.map((point) => (
              <div key={point.day} className="flex-1">
                <div
                  className="mx-auto w-2 rounded-full bg-trustBlue"
                  style={{ height: `${Math.max(point.value * 12, 4)}px` }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AuditTrail({ events }: { events: AuditEvent[] }) {
  const grouped = useMemo(() => groupEventsByDate(events), [events]);
  if (!events.length) {
    return (
      <EmptyState
        title="No audit events"
        description="Once teammates start debating, you’ll see every action logged here."
        icon={<Archive className="h-10 w-10" aria-hidden="true" />}
      />
    );
  }
  return (
    <div className="space-y-6">
      {grouped.map((group) => (
        <div key={group.label} className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Star className="h-4 w-4 text-trustBlue" aria-hidden="true" /> {group.label}
          </div>
          <div className="space-y-3 rounded-3xl border border-app bg-panel p-4 text-sm text-muted shadow-inner">
            {group.items.map((event) => (
              <div key={event.id} className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-app/60 px-2 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-trustBlue">
                  {event.type}
                </span>
                <span className="text-xs text-muted">{fmtRelative(event.at)}</span>
                <span className="text-xs text-muted">{event.actor}</span>
                {event.details ? <span className="text-xs text-ink">{event.details}</span> : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: auditData, isLoading: auditLoading } = useAudit();

  const sessions = sessionsData?.sessions ?? EMPTY_SESSIONS;
  const projects = projectsData?.projects ?? EMPTY_PROJECTS;
  const events = auditData?.events ?? EMPTY_AUDIT_EVENTS;

  const filteredSessions = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return sessions
      .filter((session) =>
        normalized
          ? session.title.toLowerCase().includes(normalized) ||
            session.preview?.toLowerCase().includes(normalized) ||
            session.providers.join(" ").toLowerCase().includes(normalized)
          : true,
      )
      .slice(0, TOP_N);
  }, [search, sessions]);

  const loading = sessionsLoading || projectsLoading || auditLoading;

  return (
    <div className="space-y-10">
      <PageHeader
        title="Sessions"
        description="Review recent debates, jump back into trusted work, and audit everything your models touched."
        actions={
          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="inline-flex items-center gap-2 rounded-full bg-trustBlue px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" /> New session
          </button>
        }
      />

      <section className="rounded-3xl border border-app bg-panel p-6 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Recent sessions</h2>
            <p className="text-sm text-muted">Top {TOP_N} threads sorted by last activity.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sessions"
                className="h-10 w-full min-w-[220px] rounded-full border border-app bg-app px-9 text-sm text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-app px-3 py-2 text-xs font-medium text-muted transition hover:border-trustBlue/60 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg"
            >
              <Filter className="h-4 w-4" aria-hidden="true" /> Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-48" />
            ))}
          </div>
        ) : filteredSessions.length ? (
          <motion.div layout className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </motion.div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No sessions match your search"
              description="Clear your filters or launch a fresh debate."
              action={
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="inline-flex items-center gap-2 rounded-full border border-trustBlue/50 px-4 py-2 text-sm font-semibold text-trustBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" /> Reset
                </button>
              }
            />
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Projects</h2>
          {projectsLoading ? (
            <Skeleton className="h-48" />
          ) : projects.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No projects yet"
              description="Create sessions to build project telemetry."
              icon={<Folder className="h-10 w-10" aria-hidden="true" />}
            />
          )}
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Audit trail</h2>
          {auditLoading ? <Skeleton className="h-64" /> : <AuditTrail events={events} />}
        </div>
      </section>
    </div>
  );
}
