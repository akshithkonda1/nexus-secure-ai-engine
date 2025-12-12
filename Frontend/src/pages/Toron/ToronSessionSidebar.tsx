import { memo, useMemo, useState } from "react";

import { useToronTelemetry } from "@/hooks/useToronTelemetry";
import { safeArray, safeFormatDistance, safeSession } from "@/shared/lib/toronSafe";
import { useToronStore } from "@/state/toron/toronStore";

export const ToronSessionSidebar = memo(() => {
  const telemetry = useToronTelemetry();
  const { sessions, activeSessionId, switchSession, createSession, deleteSession, renameSession } = useToronStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const sessionList = useMemo(() => {
    const arr = safeArray(sessions.map(safeSession));
    try {
      return arr.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    } catch (error) {
      telemetry("state_anomaly", { action: "session_sort", error: (error as Error).message });
      return arr;
    }
  }, [sessions, telemetry]);

  const beginEdit = (sessionId: string, currentTitle: string) => {
    setEditingId(sessionId);
    setDraftTitle(currentTitle);
  };

  const commitEdit = () => {
    if (!editingId) return;
    renameSession(editingId, draftTitle || "Untitled Session");
    setEditingId(null);
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4" data-testid="toron-session-sidebar">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Sessions</h2>
        <button
          type="button"
          onClick={() => switchSession(createSession("New Toron Session"))}
          className="rounded-lg border border-[var(--border-soft)]/60 px-3 py-1.5 text-xs text-[var(--text-primary)] opacity-90 hover:bg-[var(--panel-soft)]"
        >
          New
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {sessionList.map((session) => (
          <div
            role="button"
            tabIndex={0}
            key={session.sessionId}
            onClick={() => switchSession(session.sessionId)}
            onKeyDown={(e) => e.key === "Enter" && switchSession(session.sessionId)}
            className={`flex w-full flex-col gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition focus:outline-none ${
              session.sessionId === activeSessionId
                ? "border-[color-mix(in_srgb,var(--accent)_60%,transparent)] bg-[var(--accent)]/8 shadow-[0_10px_32px_rgba(0,0,0,0.18)]"
                : "border-[var(--border-soft)]/60 bg-[color-mix(in_srgb,var(--panel-soft)_92%,transparent)] hover:border-[var(--border-strong)]/80"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              {editingId === session.sessionId ? (
                <input
                  value={draftTitle}
                  autoFocus
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitEdit();
                    } else if (e.key === "Escape") {
                      setEditingId(null);
                    }
                  }}
                  className="w-full rounded border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-2 py-1 text-sm text-[var(--text-primary)] shadow-inner"
                />
              ) : (
                <span className="font-semibold text-[var(--text-primary)]">
                  {session.title || "Untitled Session"}
                </span>
              )}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    beginEdit(session.sessionId, session.title || "Untitled Session");
                  }}
                  className="rounded px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--panel-elevated)]"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.sessionId);
                    if (editingId === session.sessionId) setEditingId(null);
                  }}
                  className="session-delete-btn rounded px-2 py-1 text-xs text-[var(--text-secondary)] hover:bg-[var(--panel-elevated)]"
                  aria-label={`Delete session ${session.title}`}
                >
                  🗑
                </button>
              </div>
            </div>
            <span className="text-[0.7rem] text-[var(--text-secondary)] opacity-70">{safeFormatDistance(session.updatedAt)}</span>
          </div>
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
