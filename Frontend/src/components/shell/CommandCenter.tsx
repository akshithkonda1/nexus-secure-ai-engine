import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Maximize2, Minimize2, X } from "lucide-react";

import { cn } from "@/shared/lib/cn";

type Project = {
  id: string;
  name: string;
  status: string;
  subtitle: string;
  metric: string;
};

type UpcomingItem = {
  id: string;
  title: string;
  when: string;
};

type ResearchSignal = {
  id: string;
  title: string;
  body: string;
};

type CommandModuleId = "projects" | "upcoming" | "signals" | "connectors";

const COMMAND_MODULE_LAYOUT: CommandModuleId[] = [
  "projects",
  "upcoming",
  "signals",
  "connectors",
];

const PROJECTS: Project[] = [
  {
    id: "zora-beta-rollout",
    name: "Zora beta rollout",
    status: "Active",
    subtitle: "Workspace, safety, and projects in one place.",
    metric: "12 open threads",
  },
  {
    id: "personal-research-vault",
    name: "Personal research vault",
    status: "Review",
    subtitle: "Summaries and citations ready for export.",
    metric: "76 notes",
  },
];

const UPCOMING: UpcomingItem[] = [
  { id: "sync", title: "Workspace sync", when: "Tomorrow • 9:30am" },
  { id: "retention-review", title: "Data retention review", when: "Thu • 2:00pm" },
];

const SIGNALS: ResearchSignal[] = [
  {
    id: "safety-first",
    title: "Users check safety first",
    body: "People who visit Safety Center early tend to keep using Zora longer.",
  },
  {
    id: "voice-sessions",
    title: "Voice sessions win",
    body: "Voice-led prompts see a 18% higher completion rate than typed flows.",
  },
];

interface CommandCenterProps {
  open: boolean;
  onClose: () => void;
}

export function CommandCenter({ open, onClose }: CommandCenterProps) {
  const navigate = useNavigate();
  const [fullWidth, setFullWidth] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.setProperty("overflow", "hidden");
    } else {
      document.body.style.removeProperty("overflow");
    }

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [open]);

  const sections = useMemo(() => COMMAND_MODULE_LAYOUT, []);

  if (!open) {
    return null;
  }

  const handleNavigate = (project: Project) => {
    navigate(`/projects/${project.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close Command Center"
        className="absolute inset-0 bg-[rgba(15,23,42,0.45)] backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative flex h-[min(82vh,760px)] w-[min(94vw,1120px)] flex-col overflow-hidden rounded-[28px] border bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] text-[rgb(var(--text))] shadow-[0_40px_120px_rgba(9,12,20,0.55)] transition-[width,max-width] duration-300",
          "border-[rgba(var(--border),0.45)]",
          fullWidth ? "h-[min(90vh,820px)] w-[min(98vw,1280px)]" : "w-[min(70vw,1120px)]",
        )}
      >
        <div className="flex items-start justify-between gap-6 border-b border-[rgba(var(--border),0.35)] px-8 py-6">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[rgba(var(--subtle),0.65)]">
              Command Center
            </p>
            <p className="text-base font-medium text-[rgba(var(--subtle),0.85)]">
              Your projects, next steps, and signals in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFullWidth((prev) => !prev)}
              className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(var(--border),0.55)] bg-[rgba(var(--surface),0.65)] text-[rgba(var(--subtle),0.85)] shadow-[0_6px_18px_rgba(15,23,42,0.25)] transition hover:scale-[1.02] hover:text-[rgb(var(--text))]"
              aria-label={fullWidth ? "Exit full width" : "Expand to full width"}
            >
              {fullWidth ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(var(--border),0.55)] bg-[rgba(var(--surface),0.65)] text-[rgba(var(--subtle),0.85)] shadow-[0_6px_18px_rgba(15,23,42,0.25)] transition hover:scale-[1.02] hover:text-[rgb(var(--text))]"
              aria-label="Close Command Center"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-6 pb-8 pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((module) => {
              switch (module) {
                case "projects":
                  return (
                    <section
                      key={module}
                      className="md:col-span-2 rounded-[24px] border border-[rgba(var(--border),0.4)] bg-[rgba(var(--surface),0.86)] p-6 shadow-[0_20px_48px_rgba(8,12,24,0.35)] backdrop-blur-xl"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-semibold tracking-tight text-[rgb(var(--text))]">
                          Projects
                        </h2>
                        <span className="text-xs font-medium uppercase tracking-[0.26em] text-[rgba(var(--accent-emerald),0.85)]">
                          Active
                        </span>
                      </div>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {PROJECTS.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => handleNavigate(project)}
                            className="group flex h-full flex-col justify-between rounded-[20px] border border-[rgba(var(--border),0.38)] bg-[radial-gradient(circle_at_20%_-10%,rgba(var(--accent-emerald),0.24),transparent_55%)] p-5 text-left shadow-[0_14px_36px_rgba(11,20,36,0.35)] transition hover:-translate-y-0.5 hover:border-[rgba(var(--accent-emerald),0.65)] hover:shadow-[0_22px_48px_rgba(15,118,110,0.35)]"
                          >
                            <div className="space-y-1.5">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[rgba(var(--accent-emerald),0.85)]">
                                {project.status}
                              </p>
                              <h3 className="text-base font-semibold text-[rgb(var(--text))]">
                                {project.name}
                              </h3>
                              <p className="text-sm text-[rgba(var(--subtle),0.75)]">
                                {project.subtitle}
                              </p>
                            </div>
                            <div className="mt-6 flex items-center justify-between text-sm font-medium text-[rgba(var(--subtle),0.85)]">
                              <span>{project.metric}</span>
                              <ArrowUpRight className="size-4 text-[rgba(var(--accent-emerald),0.75)] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  );
                case "upcoming":
                  return (
                    <section
                      key={module}
                      className="rounded-[22px] border border-[rgba(var(--border),0.38)] bg-[rgba(var(--surface),0.82)] p-6 shadow-[0_16px_40px_rgba(8,12,24,0.32)] backdrop-blur-xl"
                    >
                      <header className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Upcoming</h2>
                        <span className="text-xs uppercase tracking-[0.3em] text-[rgba(var(--subtle),0.55)]">
                          Sync
                        </span>
                      </header>
                      <ul className="space-y-3 text-sm text-[rgba(var(--subtle),0.82)]">
                        {UPCOMING.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-start justify-between gap-4 rounded-[18px] border border-[rgba(var(--border),0.32)] bg-[rgba(var(--surface),0.7)] px-4 py-3 shadow-[0_10px_24px_rgba(8,12,24,0.28)]"
                          >
                            <div>
                              <p className="font-medium text-[rgb(var(--text))]">{item.title}</p>
                              <p className="text-xs uppercase tracking-[0.22em] text-[rgba(var(--subtle),0.65)]">
                                {item.when}
                              </p>
                            </div>
                            <span className="mt-1 inline-flex items-center rounded-full bg-[rgba(var(--accent-emerald),0.12)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(var(--accent-emerald),0.85)]">
                              Next
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                case "signals":
                  return (
                    <section
                      key={module}
                      className="rounded-[22px] border border-[rgba(var(--border),0.38)] bg-[rgba(var(--surface),0.82)] p-6 shadow-[0_16px_40px_rgba(8,12,24,0.32)] backdrop-blur-xl"
                    >
                      <header className="mb-4">
                        <h2 className="text-lg font-semibold text-[rgb(var(--text))]">
                          Research signals
                        </h2>
                        <p className="text-xs uppercase tracking-[0.3em] text-[rgba(var(--subtle),0.6)]">
                          Insights feed
                        </p>
                      </header>
                      <ul className="space-y-3">
                        {SIGNALS.map((signal) => (
                          <li
                            key={signal.id}
                            className="rounded-[18px] border border-[rgba(var(--border),0.3)] bg-[rgba(var(--surface),0.72)] p-4 shadow-[0_12px_28px_rgba(9,15,28,0.32)]"
                          >
                            <p className="text-sm font-semibold text-[rgb(var(--text))]">
                              {signal.title}
                            </p>
                            <p className="mt-2 text-sm text-[rgba(var(--subtle),0.78)]">{signal.body}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                case "connectors":
                  return (
                    <section
                      key={module}
                      className="md:col-span-2 rounded-[24px] border border-[rgba(var(--border),0.38)] bg-[rgba(var(--surface),0.84)] p-6 text-[rgb(var(--text))] shadow-[0_18px_44px_rgba(8,12,24,0.34)] backdrop-blur-xl"
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold">Connectors</h2>
                          <p className="mt-1 max-w-xl text-sm text-[rgba(var(--subtle),0.78)]">
                            Add GitHub, docs, and more so Zora can pull live context into your projects.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Future: open connectors browser
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--accent-emerald),0.45)] bg-[rgba(var(--accent-emerald),0.12)] px-5 py-2 text-sm font-semibold uppercase tracking-[0.26em] text-[rgba(var(--accent-emerald),0.9)] shadow-[0_12px_32px_rgba(15,118,110,0.35)] transition hover:scale-[1.01]"
                        >
                          Browse connectors
                        </button>
                      </div>
                      <div className="mt-6 rounded-[20px] border border-dashed border-[rgba(var(--border),0.35)] bg-[rgba(var(--surface),0.6)] p-5 text-sm text-[rgba(var(--subtle),0.75)]">
                        Customize Command Center layouts from Settings soon — prioritize the widgets that fuel your workflows.
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
    </div>
  );
}
