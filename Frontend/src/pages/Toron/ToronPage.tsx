import { useCallback, useEffect, useMemo, useState } from "react";

import { ToronHeader } from "@/components/toron/ToronHeader";
import { ProjectsModal } from "@/components/toron/projects/ProjectsModal";
import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { ToronInputBar } from "@/pages/Toron/ToronInputBar";
import { ToronMessageList } from "@/pages/Toron/ToronMessageList";
import { ToronSessionSidebar } from "@/pages/Toron/ToronSessionSidebar";
import { safeRender } from "@/shared/lib/safeRender";
import { useToronStore } from "@/state/toron/toronStore";

export default function ToronPage() {
  const telemetry = useToronTelemetry();
  const { sessions, activeSessionId, createSession, switchSession, getActiveSession } = useToronStore();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [pendingProjectContent, setPendingProjectContent] = useState<string | null>(null);

  useEffect(() => {
    if (sessions.length === 0) {
      const newId = createSession("New Toron Session");
      switchSession(newId);
    }
  }, [sessions.length, createSession, switchSession]);

  const activeSession = useMemo(() => getActiveSession(), [getActiveSession, sessions, activeSessionId]);

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
      <section className="relative z-10 flex min-h-screen flex-1 flex-col px-3 pt-2 sm:px-6 sm:pt-4">
        {safeRender(() => (
          <ToronHeader
            title={activeSession?.title ?? "Toron"}
            onNewChat={() => switchSession(createSession("New Toron Session"))}
            onOpenProjects={() => {
              telemetry("interaction", { action: "open_projects" });
              openProjects();
            }}
          />
        ))}
        {safeRender(() => (
          <ToronMessageList onSaveToProject={(content) => openProjects(content)} />
        ))}
        {safeRender(() => (
          <ToronInputBar
            onOpenProjects={() => openProjects()}
            onSendToProject={(content) => openProjects(content)}
          />
        ))}
        <div className="relative z-10 mb-6 mt-2 text-center text-[0.72rem] font-medium text-[var(--text-secondary)] opacity-60">
          Toron can make mistakes. Please verify important information.
        </div>
      </section>
      <aside className="toron-session-panel relative z-10 hidden w-72 lg:block">
        {safeRender(() => (
          <ToronSessionSidebar />
        ))}
      </aside>
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
