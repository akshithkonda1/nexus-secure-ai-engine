import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { NewProjectModal } from "@/components/projects/NewProjectModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { useProjects } from "@/features/projects/useProjects";

export default function ProjectDashboard() {
  const { projects, selectProject } = useProjects();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Projects</p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Persistent sanitized context</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Each project stores a safe, structured container for Toron. No raw chat logs—only sanitized graphs, tasks, and personas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_85%,var(--accent-secondary))] px-4 py-2 text-sm font-semibold text-textPrimary shadow-[0_12px_32px_rgba(124,93,255,0.28)] transition hover:-translate-y-[1px]"
        >
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={(id) => {
                void selectProject(id);
                navigate(`/projects/${id}`);
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {open && <NewProjectModal onClose={() => setOpen(false)} />}
    </div>
  );
}
