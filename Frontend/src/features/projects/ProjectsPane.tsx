import { useCallback, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";

type SpotlightProject = {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Review";
  indicator: string;
};

const spotlightProjects: SpotlightProject[] = [
  {
    id: "summarize-vnext",
    name: "Summarize vNext",
    description: "Daily briefing flow trending above baseline",
    status: "Active",
    indicator: "+12.4%",
  },
  {
    id: "knowledge-vault",
    name: "Knowledge Vault",
    description: "Awaiting compliance triage",
    status: "Review",
    indicator: "76 docs",
  },
];

function statusTone(status: SpotlightProject["status"]) {
  if (status === "Active") return "chip--ok";
  if (status === "Review") return "chip--warn";
  return "";
}

export function ProjectsPane({ standalone }: { standalone?: boolean }) {
  const navigate = useNavigate();

  const openAllProjects = useCallback(() => {
    navigate("/projects/all");
  }, [navigate]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openAllProjects();
      }
    },
    [openAllProjects],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openAllProjects}
      onKeyDown={handleKeyDown}
      className={`group relative isolate w-full cursor-pointer overflow-hidden rounded-3xl border border-border bg-card/95 p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(var(--brand),0.45)] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgba(var(--brand),0.7)] ${
        standalone ? "min-h-[22rem]" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120% 100% at 0% 0%, rgba(var(--brand),0.08), transparent)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(var(--subtle))]">
              Projects
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[rgb(var(--text))]">
              In motion
            </h2>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openAllProjects();
            }}
            className="btn btn-primary btn-neo ripple size-9 rounded-full p-0 text-lg"
            aria-label="Open all projects"
          >
            +
          </button>
        </header>

        <div className="flex flex-col gap-3">
          {spotlightProjects.map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-border/80 bg-background/90 p-4 shadow-sm transition group-hover:border-[rgba(var(--brand),0.35)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[rgb(var(--text))]">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm text-[rgb(var(--subtle))]">
                    {project.description}
                  </p>
                </div>
                <span className={`chip ${statusTone(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-[rgba(var(--brand-ink),1)]">
                <span aria-hidden className="text-base leading-none">
                  ↗
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-[rgba(var(--brand-ink),1)]">
                  {project.indicator}
                </span>
              </div>
            </article>
          ))}
        </div>

        <footer className="flex items-center justify-between text-xs text-[rgb(var(--subtle))]">
          <span>Tap to open the full project workspace</span>
          <span
            aria-hidden
            className="text-sm text-[rgba(var(--brand-ink),1)] transition group-hover:translate-x-1"
          >
            →
          </span>
        </footer>
      </div>
    </div>
  );
}
