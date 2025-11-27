import { memo, useMemo } from "react";

import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { safeArray, safeFormatDistance, safeSession } from "@/shared/lib/toronSafe";
import { useToronStore } from "@/state/toron/toronStore";

export const ToronSessionSidebar = memo(() => {
  const telemetry = useToronTelemetry();
  const { sessions, activeSessionId, switchSession, createSession } = useToronStore();

  const sessionList = useMemo(() => {
    const arr = safeArray(sessions.map(safeSession));
    try {
      return arr.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    } catch (error) {
      telemetry("state_anomaly", { action: "session_sort", error: (error as Error).message });
      return arr;
    }
  }, [sessions, telemetry]);

  return (
    <div className="flex h-full flex-col gap-3 p-3" data-testid="toron-session-sidebar">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Sessions</h2>
        <button
          type="button"
          onClick={() => switchSession(createSession("New Toron Session"))}
          className="rounded border border-[var(--border-soft)] px-2 py-1 text-xs text-[var(--text-primary)] hover:bg-[var(--panel-soft)]"
        >
          New
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {sessionList.map((session) => (
          <button
            type="button"
            key={session.sessionId}
            onClick={() => switchSession(session.sessionId)}
            className={`flex w-full flex-col gap-1 rounded-lg border px-3 py-2 text-left text-sm transition ${
              session.sessionId === activeSessionId
                ? "border-[var(--accent)] bg-[var(--accent)]/10"
                : "border-[var(--border-soft)] bg-[var(--panel-soft)] hover:border-[var(--border-strong)]"
            }`}
          >
            <span className="font-semibold text-[var(--text-primary)]">{session.title || "Untitled Session"}</span>
            <span className="text-xs text-[var(--text-secondary)]">{safeFormatDistance(session.updatedAt)}</span>
          </button>
        ))}
        {sessionList.length === 0 && (
          <div className="rounded border border-dashed border-[var(--border-soft)] bg-[var(--panel-soft)] px-3 py-2 text-xs text-[var(--text-secondary)]">
            No sessions yet. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
});

export default ToronSessionSidebar;
