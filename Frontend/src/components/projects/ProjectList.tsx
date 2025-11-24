import { motion } from "framer-motion";
import { CheckCircle, Circle, LinkIcon } from "lucide-react";

import { Project } from "@/features/projects/types";

type ProjectListProps = {
  projects: Project[];
  activeId?: string;
  onSelect: (projectId: string) => void;
};

export function ProjectList({ projects, activeId, onSelect }: ProjectListProps) {
  if (!projects.length) {
    return (
      <div className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] p-4 text-sm text-[var(--text-secondary)]">
        No projects yet. Create one to anchor Toron context.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {projects.map((project) => {
        const progressTotal = project.taskList.length || 1;
        const progressDone = project.taskList.filter((task) => task.done).length;
        const progress = Math.round((progressDone / progressTotal) * 100);
        return (
          <motion.button
            key={project.id}
            layout
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.995 }}
            type="button"
            onClick={() => onSelect(project.id)}
            className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
              activeId === project.id
                ? "border-[color-mix(in_srgb,var(--accent-primary)_60%,transparent)] bg-[color-mix(in_srgb,var(--accent-primary)_10%,transparent)]"
                : "border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)] hover:border-[color-mix(in_srgb,var(--accent-primary)_40%,transparent)]"
            }`}
          >
            <div className="flex items-center gap-3">
              {activeId === project.id ? (
                <CheckCircle className="h-5 w-5 text-[color-mix(in_srgb,var(--accent-primary)_85%,var(--text-primary))]" />
              ) : (
                <Circle className="h-5 w-5 text-[var(--text-secondary)]" />
              )}
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{project.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">Updated {new Date(project.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] px-2 py-1 font-semibold text-[color-mix(in_srgb,var(--accent-primary)_90%,var(--text-primary))]">
                {progress}% ready
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] px-2 py-1 text-[11px]">
                <LinkIcon className="h-3.5 w-3.5" />
                {Object.values(project.connectorsEnabled).filter(Boolean).length} connectors
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
