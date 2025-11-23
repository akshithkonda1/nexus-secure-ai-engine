import { useMemo } from "react";
import { useProjects } from "@/queries/sessions";
import { formatRelativeTime } from "@/lib/formatters";
import type { Project } from "@/types/models";

function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function emptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/60 p-12 text-center">
      <div className="text-2xl">📂</div>
      <h3 className="mt-3 text-lg font-semibold text-foreground">No projects yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Projects connect related conversations and documents. Start a project to keep multi-model workstreams organized.
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-border/70 bg-card/60 p-6">
      <div className="h-4 w-1/3 rounded bg-muted" />
      <div className="mt-3 h-4 w-2/3 rounded bg-muted" />
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="h-3 rounded bg-muted" />
        <div className="h-3 rounded bg-muted" />
        <div className="h-3 rounded bg-muted" />
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const updated = useMemo(() => formatRelativeTime(project.updatedAt), [project.updatedAt]);

  return (
    <article className="flex h-full flex-col justify-between rounded-3xl border border-border bg-card/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(var(--brand),0.35)] hover:shadow-lg">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {project.description ?? "Project description pending connection to the workspace."}
            </p>
          </div>
          <span className="rounded-full bg-[rgba(var(--brand),0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[rgba(var(--brand-ink),1)]">
            {project.activeCount > 0 ? "Active" : "Idle"}
          </span>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sessions</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">{project.sessionsCount}</dd>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Active threads</dt>
          <dd className="mt-1 text-lg font-semibold text-foreground">{project.activeCount}</dd>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/80 p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Updated</dt>
          <dd className="mt-1 text-sm font-medium text-foreground">{updated}</dd>
        </div>
      </dl>
    </article>
  );
}

export default function ProjectsAllPage() {
  const { data, isLoading, isError } = useProjects();
  const projects = data?.projects ?? [];
  const sorted = useMemo(() => sortProjects(projects), [projects]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Projects</p>
          <h1 className="mt-1 text-3xl font-semibold text-foreground">All initiatives</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Review every project wired to Ryuzen AI. Metrics update automatically once the backend service is connected.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full bg-[rgba(var(--brand),1)] px-4 py-2 text-sm font-semibold text-[rgb(var(--on-accent))] shadow-sm transition hover:bg-[rgba(var(--brand-ink),1)]"
        >
          New project
        </button>
      </header>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-[rgba(220,68,68,0.35)] bg-[rgba(220,68,68,0.12)] p-6 text-sm text-[rgba(175,40,40,1)]">
          Unable to load projects. Please try again once the service is online.
        </div>
      ) : projects.length === 0 ? (
        emptyState()
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
