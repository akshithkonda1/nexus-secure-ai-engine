import { useEffect, useMemo, useState } from "react";

import { ProjectCard } from "@/components/toron/projects/ProjectCard";
import { ProjectEditor } from "@/components/toron/projects/ProjectEditor";
import { useProjectStore } from "@/state/projects/projectStore";
import type { ProjectItem } from "@/state/projects/projectStore";

interface ProjectsModalProps {
  prefillContent?: string;
  onClose?: () => void;
  onSaved?: () => void;
}

export function ProjectsModal({ prefillContent, onClose, onSaved }: ProjectsModalProps) {
  const { projects, createProject, deleteProject, renameProject, addItem, deleteItem, updateItem } = useProjectStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("New Project");

  useEffect(() => {
    if (projects.length > 0 && !selectedId) {
      setSelectedId(projects[0].id);
    }
  }, [projects, selectedId]);

  const selectedProject = useMemo(() => projects.find((p) => p.id === selectedId), [projects, selectedId]);

  const handleCreate = () => {
    const id = createProject(newProjectName);
    setSelectedId(id);
    setNewProjectName("New Project");
  };

  const handleAddItem = (item: ProjectItem) => {
    if (!selectedProject) return;
    addItem(selectedProject.id, item);
    onSaved?.();
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedProject) return;
    deleteItem(selectedProject.id, itemId);
  };

  const handleUpdateItem = (itemId: string, content: string) => {
    if (!selectedProject) return;
    updateItem(selectedProject.id, itemId, content);
  };

  return (
    <div className="w-full max-w-5xl rounded-xl border border-[var(--border-strong)] bg-[var(--panel-strong)] p-4 shadow-2xl" role="dialog">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border-soft)] pb-2">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Projects</h3>
          <p className="text-sm text-[var(--text-secondary)]">Organize Toron outputs and notes into long-lived workspaces.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-[var(--border-soft)] px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--panel-elevated)]"
        >
          Close
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-soft)] p-3">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">New Project</h4>
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="mt-2 w-full rounded border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-2 py-1 text-sm text-[var(--text-primary)]"
            />
            <button
              type="button"
              onClick={handleCreate}
              className="mt-2 w-full rounded border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)]"
            >
              Create
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto rounded-lg border border-[var(--border-soft)] bg-[var(--panel-soft)] p-3 max-h-[420px]">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                selected={project.id === selectedId}
                onSelect={(id) => setSelectedId(id)}
                onDelete={deleteProject}
                onRename={renameProject}
              />
            ))}
            {projects.length === 0 && (
              <div className="rounded border border-dashed border-[var(--border-soft)] bg-[var(--panel-elevated)] p-3 text-xs text-[var(--text-secondary)]">
                No projects yet. Create one to anchor Toron context.
              </div>
            )}
          </div>
        </div>

        <ProjectEditor
          project={selectedProject}
          prefillContent={prefillContent}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
          onUpdateItem={handleUpdateItem}
        />
      </div>
    </div>
  );
}

export default ProjectsModal;
