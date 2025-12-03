import React, { useEffect, useMemo, useState } from "react";
import { ProjectList } from "./ProjectList";
import { ThreadList } from "./ThreadList";
import { ThreadViewer } from "./ThreadViewer";
import { projectsStore } from "@/state/projects/projectsStore";
import { Thread } from "@/types/projects";

interface ProjectsModalProps {
  onClose: () => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({ onClose }) => {
  const {
    projects,
    activeProjectId,
    activeThreadId,
    loading,
    setActiveProjectThread,
    createProject,
    renameProject,
    deleteProject,
    createThread,
    getThreadContext,
  } = projectsStore.use();

  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  useEffect(() => {
    projectsStore.getProjects().catch(() => {
      /* handled silently */
    });
  }, []);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? projects[0],
    [projects, activeProjectId],
  );

  useEffect(() => {
    if (activeProject) {
      const thread =
        activeProject.threads.find((t) => t.id === activeThreadId) ??
        activeProject.threads[0] ??
        null;
      setSelectedThread(thread ?? null);
    }
  }, [activeProject, activeThreadId]);

  const handleCreateProject = async () => {
    const name = prompt("Project name", "New project");
    if (!name) return;
    const project = await createProject(name);
    if (project.threads[0]) {
      setSelectedThread(project.threads[0]);
    }
  };

  const handleRenameProject = async (projectId: string) => {
    const existing = projects.find((p) => p.id === projectId);
    const name = prompt("Rename project", existing?.name ?? "");
    if (!name) return;
    await renameProject(projectId, name);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Delete project and all threads?")) return;
    await deleteProject(projectId);
    setSelectedThread(null);
  };

  const handleCreateThread = async () => {
    if (!activeProject) return;
    const title = prompt("Thread title", "New thread");
    if (!title) return;
    const thread = await createThread(activeProject.id, title);
    setSelectedThread(thread);
    setActiveProjectThread(activeProject.id, thread.id);
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const thread = project?.threads?.[0];
    setActiveProjectThread(projectId, thread?.id);
    setSelectedThread(thread ?? null);
  };

  const handleSelectThread = async (threadId: string) => {
    if (!activeProject) return;
    setActiveProjectThread(activeProject.id, threadId);
    const context = await getThreadContext(activeProject.id, threadId);
    setSelectedThread(context);
  };

  const handleOpenInChat = () => {
    if (activeProject && selectedThread) {
      setActiveProjectThread(activeProject.id, selectedThread.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bgElevated/50 p-4">
      <div className="flex h-[80vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-bgPrimary shadow-2xl dark:bg-bgElevated">
        <div className="flex items-center justify-between border-b border-borderLight px-6 py-4 dark:border-borderStrong">
          <div>
            <h2 className="text-lg font-semibold text-textPrimary dark:text-textPrimary">Projects</h2>
            <p className="text-xs text-textSecondary">
              Organize sanitized threads and open them directly in Chat.
              {loading ? " Loading..." : ""}
            </p>
          </div>
          <button
            className="rounded border border-borderLight px-3 py-2 text-xs font-semibold text-textSecondary transition hover:bg-bgPrimary dark:border-borderStrong dark:text-textMuted dark:hover:bg-bgElevated"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <ProjectList
            projects={projects}
            activeProjectId={activeProject?.id}
            onSelect={handleSelectProject}
            onCreate={handleCreateProject}
            onRename={handleRenameProject}
            onDelete={handleDeleteProject}
          />
          <ThreadList
            threads={activeProject?.threads ?? []}
            activeThreadId={selectedThread?.id}
            onSelect={handleSelectThread}
            onCreate={handleCreateThread}
          />
          <div className="flex min-w-0 flex-1">
            <ThreadViewer thread={selectedThread} onOpenInChat={handleOpenInChat} />
          </div>
        </div>
      </div>
    </div>
  );
};
