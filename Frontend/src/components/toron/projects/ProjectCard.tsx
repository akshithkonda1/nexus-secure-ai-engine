import { useEffect, useState } from "react";

import type { Project } from "@/state/projects/projectStore";

interface ProjectCardProps {
  project: Project;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
}

const formatUpdatedAt = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

export function ProjectCard({ project, selected, onSelect, onDelete, onRename }: ProjectCardProps) {
  const [name, setName] = useState(project.name);

  useEffect(() => {
    setName(project.name);
  }, [project.name]);

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border px-3 py-2 text-left text-sm shadow-sm transition ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent)]/10"
          : "border-[var(--border-soft)] bg-[var(--panel-soft)] hover:border-[var(--border-strong)]"
      }`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(project.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.(project.id)}
    >
      <div className="flex items-center justify-between gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onRename?.(project.id, name)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onRename?.(project.id, name);
            }
          }}
          className="w-full rounded border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-2 py-1 text-sm text-[var(--text-primary)] shadow-inner"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(project.id);
          }}
          className="rounded px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--panel-elevated)]"
          aria-label={`Delete project ${project.name}`}
        >
          🗑
        </button>
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>{project.items.length} items</span>
        <span>Updated {formatUpdatedAt(project.updatedAt)}</span>
      </div>
    </div>
  );
}

export default ProjectCard;
