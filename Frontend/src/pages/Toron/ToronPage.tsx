import { useEffect } from "react";
import { ToronHeader } from "@/components/toron/ToronHeader";
import { ToronMessageList } from "@/pages/Toron/ToronMessageList";
import { ToronInputBar } from "@/pages/Toron/ToronInputBar";
import { useToronSessionStore } from "@/state/toron/toronSessionStore";
import { ToronSessionSidebar } from "@/pages/Toron/ToronSessionSidebar";

export default function ToronPage() {
  const {
    sessions,
    activeSessionId,
    hydrateSessions,
    createSession,
  } = useToronSessionStore();

  useEffect(() => {
    // initial load
    hydrateSessions().then(async () => {
      // if no sessions exist, create the first one
      const hasAny = Object.keys(useToronSessionStore.getState().sessions).length > 0;
      if (!hasAny) {
        await createSession("New Toron Session");
      }
    });
  }, [hydrateSessions, createSession]);

  const activeSession = activeSessionId
    ? sessions[activeSessionId]
    : null;

  return (
    <main className="relative flex h-full min-h-screen flex-row">
      <section className="flex min-h-screen flex-1 flex-col">
        <ToronHeader />
        <ToronMessageList
          session={activeSession}
        />
        <ToronInputBar
          sessionId={activeSession?.sessionId ?? null}
        />
      </section>

      {/* Right-hand session list, ChatGPT-style */}
      <aside className="hidden w-72 border-l border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] lg:block">
        <ToronSessionSidebar />
      </aside>
    </main>
  );
}
