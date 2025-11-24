import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, CheckCircle2, ListChecks, Shield } from "lucide-react";

import { useProjects } from "@/features/projects/useProjects";

export default function ProjectView() {
  const { id } = useParams();
  const { projects, updateProject, selectProject } = useProjects();

  const project = useMemo(() => projects.find((item) => item.id === id), [id, projects]);

  if (!project) {
    return (
      <div className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_88%,transparent)] p-6 text-[var(--text-primary)]">
        Project not found.
      </div>
    );
  }

  const toggleTask = (taskId: string) => {
    const nextTasks = project.taskList.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task,
    );
    void updateProject(project.id, { taskList: nextTasks });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Project</p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{project.name}</h1>
          <p className="text-sm text-[var(--text-secondary)]">Continuity and persona states are scoped here.</p>
        </div>
        <button
          type="button"
          onClick={() => selectProject(project.id)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_82%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px]"
        >
          <BadgeCheck className="h-4 w-4 text-[color-mix(in_srgb,var(--accent-secondary)_85%,var(--text-primary))]" /> Activate in Toron
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_88%,transparent)] p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <Shield className="h-5 w-5 text-[color-mix(in_srgb,var(--accent-primary)_80%,var(--text-primary))]" />
            Sanitized summary
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {project.summary || "No summary yet. Add a sanitized, PII-free brief in this container."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] p-3 text-sm text-[var(--text-primary)]">
              Continuity score: {Math.round(project.contextState.continuityScore * 100)}%
            </div>
            <div className="rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] p-3 text-sm text-[var(--text-primary)]">
              Difficulty rating: {Math.round(project.contextState.difficultyScore * 100)}%
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_84%,transparent)] p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">
            <ListChecks className="h-5 w-5 text-[color-mix(in_srgb,var(--accent-secondary)_85%,var(--text-primary))]" />
            Tasks
          </h2>
          <div className="space-y-2">
            {project.taskList.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">No tasks. Add sanitized tasks to guide Toron.</p>
            ) : (
              project.taskList.map((task) => (
                <motion.button
                  key={task.id}
                  layout
                  whileHover={{ x: 4 }}
                  onClick={() => toggleTask(task.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                    task.done
                      ? "border-[color-mix(in_srgb,var(--accent-secondary)_50%,transparent)] bg-[color-mix(in_srgb,var(--accent-secondary)_12%,transparent)] text-[var(--text-primary)]"
                      : "border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)] text-[var(--text-secondary)]"
                  }`}
                >
                  {task.done ? (
                    <CheckCircle2 className="h-4 w-4 text-[color-mix(in_srgb,var(--accent-secondary)_90%,var(--text-primary))]" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-[var(--border-soft)]" />
                  )}
                  <span>{task.text}</span>
                </motion.button>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
