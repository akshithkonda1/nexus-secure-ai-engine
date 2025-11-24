import { motion } from "framer-motion";
import { ArrowRight, CheckSquare, GitBranch, Sparkles } from "lucide-react";

import { Project } from "@/features/projects/types";

export function ProjectCard({ project, onOpen }: { project: Project; onOpen?: (id: string) => void }) {
  const progressTotal = project.taskList.length || 1;
  const progressDone = project.taskList.filter((task) => task.done).length;
  const progress = Math.round((progressDone / progressTotal) * 100);
  const connectorCount = Object.values(project.connectorsEnabled).filter(Boolean).length;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_88%,transparent)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(124,93,255,0.22),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.16),transparent_42%)] opacity-75" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--panel-strong)_75%,transparent)] px-3 py-1 text-xs font-semibold text-[color-mix(in_srgb,var(--accent-primary)_90%,var(--text-primary))] shadow-inner shadow-black/20">
            <Sparkles className="mr-1 h-4 w-4" /> Project container
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">
            v{project.version ?? 1}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{project.name}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-[var(--text-secondary)]">
            {project.summary || "Sanitized context stored for Toron."}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] px-3 py-2 font-semibold text-[color-mix(in_srgb,var(--accent-primary)_95%,var(--text-primary))]">
          <CheckSquare className="h-4 w-4" /> {progress}% tasks calibrated
        </span>
        <span className="inline-flex items-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--panel-strong)_78%,transparent)] px-3 py-2 font-semibold text-[var(--text-primary)]">
          <GitBranch className="h-4 w-4 text-[color-mix(in_srgb,var(--accent-secondary)_90%,var(--text-primary))]" />
          {connectorCount} connectors
        </span>
      </div>

      <div className="relative mt-5 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)]">Continuity</span>
          <div className="h-2 w-24 rounded-full bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)]">
            <div
              className="h-full rounded-full bg-[color-mix(in_srgb,var(--accent-secondary)_90%,var(--accent-primary))]"
              style={{ width: `${Math.round(project.contextState.continuityScore * 100)}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpen?.(project.id)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_80%,transparent)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px] hover:border-[color-mix(in_srgb,var(--accent-primary)_40%,transparent)]"
        >
          Open <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
