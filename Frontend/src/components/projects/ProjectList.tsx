import React from "react";
import { Project } from "@/types/projects";

interface ProjectListProps {
  projects: Project[];
  activeProjectId?: string;
  onSelect: (projectId: string) => void;
  onCreate: () => void;
  onRename: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  activeProjectId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}) => {
  return (
    <div className="border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">Projects</h3>
        <button
          className="rounded border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          onClick={onCreate}
          type="button"
        >
          + New
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto">
        {projects.map((project) => (
          <div
            key={project.id}
            className={[
              "flex items-center justify-between px-4 py-3 text-sm transition",
              project.id === activeProjectId
                ? "bg-slate-100 font-semibold dark:bg-slate-800"
                : "hover:bg-slate-50 dark:hover:bg-slate-800/60",
            ].join(" ")}
          >
            <button
              className="flex-1 text-left text-slate-800 focus:outline-none dark:text-slate-100"
              type="button"
              onClick={() => onSelect(project.id)}
            >
              <div className="truncate">{project.name}</div>
              <div className="text-xs text-slate-500">
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </button>
            <div className="ml-2 flex gap-1">
              <button
                className="rounded px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                onClick={() => onRename(project.id)}
                type="button"
                title="Rename project"
              >
                Rename
              </button>
              <button
                className="rounded px-2 py-1 text-xs text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-900/40"
                onClick={() => onDelete(project.id)}
                type="button"
                title="Delete project"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-slate-500">
            No projects yet. Create one to start organizing threads.
          </div>
        )}
      </div>
    </div>
  );
};
