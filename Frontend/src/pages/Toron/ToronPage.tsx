import { useEffect, useMemo } from "react";

import { ToronHeader } from "@/components/toron/ToronHeader";
import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { ToronInputBar } from "@/pages/Toron/ToronInputBar";
import { ToronMessageList } from "@/pages/Toron/ToronMessageList";
import { ToronSessionSidebar } from "@/pages/Toron/ToronSessionSidebar";
import { safeRender } from "@/shared/lib/safeRender";
import { safeSession } from "@/shared/lib/toronSafe";
import { useToronSessionStore } from "@/state/toron/toronSessionStore";

export default function ToronPage() {
  const telemetry = useToronTelemetry();
  const { sessions, activeSessionId, hydrateSessions, createSession, selectSession } = useToronSessionStore();

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        await hydrateSessions();
        const hasSessions = Object.keys(useToronSessionStore.getState().sessions).length > 0;
        if (!hasSessions) {
          await createSession("New Toron Session");
        }
      } catch (error) {
        telemetry("network_error", { action: "hydrate_on_mount", error: (error as Error).message });
      }
    };
    void load();
    return () => controller.abort();
  }, [hydrateSessions, createSession, telemetry]);

  const activeSession = useMemo(() => {
    if (!activeSessionId) return null;
    const session = sessions[activeSessionId];
    return session ? safeSession(session) : null;
  }, [activeSessionId, sessions]);

  return (
    <main className="relative flex h-full min-h-screen flex-row">
      <section className="flex min-h-screen flex-1 flex-col">
        {safeRender(() => (
          <ToronHeader
            title={activeSession?.title ?? "Toron"}
            onNewChat={() => createSession("New Toron Session").then((id) => selectSession(id))}
            onOpenProjects={() => telemetry("interaction", { action: "open_projects" })}
          />
        ))}
        {safeRender(() => (
          <ToronMessageList session={activeSession} />
        ))}
        {safeRender(() => (
          <ToronInputBar sessionId={activeSession?.sessionId ?? null} />
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
