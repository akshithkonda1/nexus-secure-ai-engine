import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, Filter, History, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { useHistory as useHistoryQuery } from "@/queries/history";
import { useProjects, useSessions } from "@/queries/sessions";
import type { AuditEvent } from "@/types/models";

function groupEventsByDate(events: AuditEvent[]) {
  const map = new Map<string, AuditEvent[]>();
  events.forEach((event) => {
    const key = new Date(event.at).toDateString();
    const list = map.get(key) ?? [];
    list.push(event);
    map.set(key, list);
  });
  return Array.from(map.entries()).map(([label, items]) => ({
    label,
    items: items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
  }));
}

const EMPTY_AUDIT_EVENTS: AuditEvent[] = [];

export default function HistoryPage() {
  const [params, setParams] = useSearchParams();
  const [type, setType] = useState(params.get("type") ?? "all");
  const [sessionId, setSessionId] = useState(params.get("sessionId") ?? "");
  const [projectId, setProjectId] = useState(params.get("projectId") ?? "");
  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");

  const filters = useMemo(
    () => ({
      type: type === "all" ? undefined : type,
      sessionId: sessionId || undefined,
      projectId: projectId || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [type, sessionId, projectId, from, to],
  );

  const historyQuery = useHistoryQuery(filters);
  const sessionsQuery = useSessions();
  const projectsQuery = useProjects();

  useEffect(() => {
    const next = new URLSearchParams();
    if (filters.type) next.set("type", filters.type);
    if (filters.sessionId) next.set("sessionId", filters.sessionId);
    if (filters.projectId) next.set("projectId", filters.projectId);
    if (filters.from) next.set("from", filters.from);
    if (filters.to) next.set("to", filters.to);
    setParams(next, { replace: true });
  }, [filters, setParams]);

  const events = historyQuery.data?.events ?? EMPTY_AUDIT_EVENTS;
  const grouped = useMemo(() => groupEventsByDate(events), [events]);

  const resetFilters = () => {
    setType("all");
    setSessionId("");
    setProjectId("");
    setFrom("");
    setTo("");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="History"
        description="Inspect every action across Ryuzen sessions with fine-grained filters."
      />

      <section className="rounded-3xl border border-app bg-panel panel panel--glassy panel--hover p-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-5 w-5 text-trustBlue" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-ink">Filters</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <label className="flex flex-col gap-2 text-sm text-muted">
            Type
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-10 rounded-full border border-app bg-app px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
            >
              <option value="all">All types</option>
              <option value="created">Created</option>
              <option value="message">Message</option>
              <option value="modelRun">Model run</option>
              <option value="archived">Archived</option>
              <option value="restored">Restored</option>
              <option value="deleted">Deleted</option>
              <option value="exported">Exported</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted">
            Session
            <select
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              className="h-10 rounded-full border border-app bg-app px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
            >
              <option value="">All sessions</option>
              {(sessionsQuery.data?.sessions ?? []).map((session) => (
                <option key={session.id} value={session.id}>
                  {session.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted">
            Project
            <select
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className="h-10 rounded-full border border-app bg-app px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
            >
              <option value="">All projects</option>
              {(projectsQuery.data?.projects ?? []).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted">
            From
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="h-10 rounded-full border border-app bg-app px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-muted">
            To
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="h-10 rounded-full border border-app bg-app px-4 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustBlue/70"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <span>Persisted to URL for easy sharing.</span>
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-full border border-app px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-trustBlue/60 hover:text-ink"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Reset filters
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-app bg-panel panel panel--glassy panel--hover p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-trustBlue" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-ink">Audit log</h2>
        </div>
        {historyQuery.isLoading ? (
          <div className="mt-6 space-y-3" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20" />
            ))}
          </div>
        ) : events.length ? (
          <div className="mt-6 space-y-6">
            {grouped.map((group) => (
              <div key={group.label} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Calendar className="h-4 w-4 text-trustBlue" aria-hidden="true" /> {group.label}
                </div>
                <div className="space-y-3 rounded-3xl border border-app bg-app/60 p-4 text-sm text-muted">
                  {group.items.map((event) => (
                    <div key={event.id} className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-trustBlue/10 px-2 py-1 text-[0.7rem] uppercase tracking-[0.2em] text-trustBlue">
                        {event.type}
                      </span>
                      <span className="text-xs text-muted">{new Date(event.at).toLocaleTimeString()}</span>
                      {event.sessionId ? <span className="text-xs text-muted">Session: {event.sessionId}</span> : null}
                      {event.projectId ? <span className="text-xs text-muted">Project: {event.projectId}</span> : null}
                      {event.details ? <span className="text-xs text-ink">{event.details}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No history"
              description="Adjust your filters or run new sessions to generate activity."
            />
          </div>
        )}
      </section>
    </div>
  );
}
