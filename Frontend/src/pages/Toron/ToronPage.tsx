import { useEffect, useMemo } from "react";

import { ToronHeader } from "@/components/toron/ToronHeader";
import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { ToronInputBar } from "@/pages/Toron/ToronInputBar";
import { ToronMessageList } from "@/pages/Toron/ToronMessageList";
import { ToronSessionSidebar } from "@/pages/Toron/ToronSessionSidebar";
import { safeRender } from "@/shared/lib/safeRender";
import { useToronStore } from "@/state/toron/toronStore";

export default function ToronPage() {
  const telemetry = useToronTelemetry();
  const { sessions, activeSessionId, createSession, switchSession, getActiveSession } = useToronStore();

  useEffect(() => {
    if (sessions.length === 0) {
      const newId = createSession("New Toron Session");
      switchSession(newId);
    }
  }, [sessions.length, createSession, switchSession]);

  const activeSession = useMemo(() => getActiveSession(), [getActiveSession, sessions, activeSessionId]);

  return (
    <main className="relative flex h-full min-h-screen flex-row">
      <section className="flex min-h-screen flex-1 flex-col">
        {safeRender(() => (
          <ToronHeader
            title={activeSession?.title ?? "Toron"}
            onNewChat={() => switchSession(createSession("New Toron Session"))}
            onOpenProjects={() => telemetry("interaction", { action: "open_projects" })}
          />
        ))}
        {safeRender(() => (
          <ToronMessageList />
        ))}
        {safeRender(() => (
          <ToronInputBar />
        ))}
      </section>
      <aside className="hidden w-72 border-l border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] lg:block">
        {safeRender(() => (
          <ToronSessionSidebar />
        ))}
      </aside>
    </main>
  );
}
