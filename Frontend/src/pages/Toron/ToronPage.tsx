import { useCallback, useState } from "react";

import { ProjectsModal } from "@/components/toron/projects/ProjectsModal";
import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { ToronChatShell } from "@/pages/Toron/chat/ToronChatShell";
import { safeRender } from "@/shared/lib/safeRender";

export default function ToronPage() {
  const telemetry = useToronTelemetry();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [pendingProjectContent, setPendingProjectContent] = useState<string | null>(null);

  const openProjects = useCallback(
    (content?: string) => {
      setPendingProjectContent(content ?? null);
      setProjectsOpen(true);
    },
    [],
  );

  const closeProjects = useCallback(() => {
    setProjectsOpen(false);
    setPendingProjectContent(null);
  }, []);

  const handleProjectSaved = useCallback(() => {
    if (pendingProjectContent) {
      closeProjects();
    }
  }, [closeProjects, pendingProjectContent]);

  return (
    <main className="toron-shell relative flex min-h-screen flex-row">
      {safeRender(() => (
        <ToronChatShell
          onOpenProjects={() => {
            telemetry("interaction", { action: "open_projects" });
            openProjects();
          }}
          onSaveToProject={(content) => openProjects(content)}
        />
      ))}
      {projectsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bgElevated/40 p-4">
          <ProjectsModal
            prefillContent={pendingProjectContent ?? undefined}
            onClose={closeProjects}
            onSaved={handleProjectSaved}
          />
        </div>
      )}
    </main>
  );
}
