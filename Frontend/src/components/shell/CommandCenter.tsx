import { useEffect } from "react";
import { Maximize2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CommandCenterProps {
  open: boolean;
  onClose: () => void;
}

type CommandModuleId = "projects" | "upcoming" | "signals" | "connectors";

const COMMAND_MODULE_LAYOUT: CommandModuleId[] = [
  "projects",
  "upcoming",
  "signals",
  "connectors",
];

const PROJECTS = [
  {
    id: "proj-zora-beta",
    name: "Zora beta rollout",
    status: "Active",
    subtitle: "Command Center, safety, and projects wired together.",
    metric: "12 live threads",
  },
  {
    id: "proj-research-hub",
    name: "Research hub",
    status: "Review",
    subtitle: "Summaries and citations queued for export.",
    metric: "76 notes",
  },
];

const UPCOMING = [
  { id: "up-1", title: "Workspace sync", when: "Tomorrow • 9:30am" },
  { id: "up-2", title: "Data retention review", when: "Thu • 2:00pm" },
];

const SIGNALS = [
  {
    id: "sig-1",
    title: "Safety-first users stick around",
    body: "People who visit the safety page early tend to stay longer in Zora.",
  },
  {
    id: "sig-2",
    title: "Voice sessions perform better",
    body: "Voice-led prompts see ~18% higher completion than typed-only flows.",
  },
];

export function CommandCenter({ open, onClose }: CommandCenterProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleNavigateToProject = (id: string) => {
    navigate(`/projects/${id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close Command Center"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(15,23,42,0.45)] backdrop-blur-sm"
      />

      <div className="relative w-[min(70vw,1120px)] max-w-[1120px] h-[min(80vh,720px)] rounded-[28px] border border-[rgba(var(--border),0.5)] bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(var(--border),0.35)] px-6 py-5">
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[rgba(var(--subtle),0.7)]">
              Command Center
            </span>
            <p className="max-w-xl text-sm text-[rgba(var(--subtle),0.9)]">
              Your projects, next steps, and signals in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(var(--border),0.5)] bg-[rgba(15,23,42,0.75)] text-[rgba(var(--subtle),0.75)] transition hover:text-[rgba(var(--subtle),0.95)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--brand),0.55)] focus:ring-offset-1 focus:ring-offset-[rgba(15,23,42,0.65)]"
              aria-label="Toggle fullscreen"
            >
              <Maximize2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(var(--border),0.55)] bg-[rgba(30,41,59,0.85)] text-[rgba(var(--subtle),0.75)] transition hover:text-[rgba(var(--subtle),0.95)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-emerald),0.55)] focus:ring-offset-1 focus:ring-offset-[rgba(15,23,42,0.65)]"
              aria-label="Close Command Center"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 h-[calc(100%-5.5rem)] overflow-y-auto px-6 pb-6 space-y-4">
          {COMMAND_MODULE_LAYOUT.map((module) => {
            switch (module) {
              case "projects":
                return (
                  <section
                    key={module}
                    className="panel panel--glassy panel--glow rounded-[24px] border border-[rgba(var(--border),0.55)] bg-[radial-gradient(circle_at_top,_rgba(var(--brand-soft),0.16),_transparent)_0_0/100%_60%_no-repeat,_rgba(15,23,42,0.92)] p-6 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(var(--subtle),0.7)]">
                          Projects
                        </p>
                        <p className="text-sm text-[rgba(var(--subtle),0.9)]">
                          Orbiting the work you care about right now.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {PROJECTS.map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => handleNavigateToProject(project.id)}
                          className="group flex h-full flex-col justify-between rounded-[22px] border border-[rgba(var(--accent-emerald),0.4)] bg-[rgba(15,23,42,0.82)] p-5 text-left shadow-[0_0_24px_rgba(var(--accent-emerald),0.16)] transition hover:-translate-y-0.5 hover:border-[rgba(var(--accent-emerald),0.65)] hover:shadow-[0_12px_36px_rgba(var(--accent-emerald),0.32)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-emerald),0.7)] focus:ring-offset-2 focus:ring-offset-[rgba(15,23,42,0.55)]"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-[rgba(var(--accent-emerald),0.75)]">
                              <span>{project.status}</span>
                              <span className="rounded-full bg-[rgba(var(--accent-emerald),0.2)] px-2 py-0.5 text-[10px] font-semibold text-[rgb(var(--accent-emerald-ink))]">
                                {project.metric}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <p className="text-lg font-semibold text-[rgba(255,255,255,0.92)]">{project.name}</p>
                              <p className="text-sm text-[rgba(var(--subtle),0.85)]">{project.subtitle}</p>
                            </div>
                          </div>
                          <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[rgba(var(--accent-emerald),0.85)] transition group-hover:translate-x-1">
                            View project ↗
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              case "upcoming":
                return (
                  <div key={module} className="grid gap-4 md:grid-cols-2">
                    <section className="panel panel--glassy panel--glow rounded-[24px] border border-[rgba(var(--border),0.55)] bg-[rgba(15,23,42,0.9)] p-6 shadow-[var(--shadow-soft)]">
                      <div className="flex items-baseline justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(var(--subtle),0.7)]">
                          Upcoming
                        </p>
                        <span className="text-[11px] uppercase tracking-[0.28em] text-[rgba(var(--subtle),0.55)]">Workspace sync</span>
                      </div>
                      {/* TODO: Replace with live workspace data once available. */}
                      <ul className="mt-4 space-y-3">
                        {UPCOMING.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between rounded-[18px] border border-[rgba(var(--border),0.45)] bg-[rgba(15,23,42,0.78)] px-4 py-3 text-sm text-[rgba(var(--subtle),0.88)]"
                          >
                            <span>{item.title}</span>
                            <span className="text-xs text-[rgba(var(--subtle),0.65)]">{item.when}</span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="panel panel--glassy panel--glow rounded-[24px] border border-[rgba(var(--border),0.55)] bg-[rgba(15,23,42,0.9)] p-6 shadow-[var(--shadow-soft)]">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(var(--subtle),0.7)]">
                        Research signals
                      </p>
                      <div className="mt-4 space-y-3">
                        {SIGNALS.map((signal) => (
                          <article
                            key={signal.id}
                            className="rounded-[20px] border border-[rgba(var(--border),0.45)] bg-[rgba(15,23,42,0.78)] p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                          >
                            <h3 className="text-sm font-semibold text-[rgba(255,255,255,0.92)]">{signal.title}</h3>
                            <p className="mt-1 text-sm text-[rgba(var(--subtle),0.8)]">{signal.body}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  </div>
                );
              case "signals":
                return null;
              case "connectors":
                return (
                  <section
                    key={module}
                    className="panel panel--glassy panel--glow rounded-[24px] border border-[rgba(var(--border),0.55)] bg-[radial-gradient(circle_at_top,_rgba(var(--brand-soft),0.14),_transparent)_0_0/100%_60%_no-repeat,_rgba(15,23,42,0.9)] p-6 shadow-[var(--shadow-soft)]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(var(--subtle),0.7)]">
                          Connectors
                        </p>
                        <p className="text-sm text-[rgba(var(--subtle),0.88)]">
                          Add GitHub, docs, and more so Zora can pull live context into your projects.
                        </p>
                      </div>
                      <button
                        type="button"
                        // TODO: Wire this to settings/integrations when connectors launch.
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--accent-emerald),0.6)] bg-[rgba(var(--accent-emerald),0.16)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgb(var(--accent-emerald-ink))] shadow-[0_0_18px_rgba(var(--accent-emerald),0.28)] transition hover:bg-[rgba(var(--accent-emerald),0.22)] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-emerald),0.6)] focus:ring-offset-2 focus:ring-offset-[rgba(15,23,42,0.55)]"
                      >
                        Browse connectors ↗
                      </button>
                    </div>
                  </section>
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
