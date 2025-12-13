import { useMemo, useState } from "react";

import { safeArray, safeString } from "@/shared/lib/toronSafe";
import { useToronStore } from "@/state/toron/toronStore";

interface SessionSidebarProps {
  onNewSession: () => void;
}

export function SessionSidebar({ onNewSession }: SessionSidebarProps) {
  const { sessions, activeSessionId, switchSession, renameSession, deleteSession } = useToronStore();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const orderedSessions = useMemo(
    () => safeArray(sessions, []).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")),
    [sessions],
  );

  return (
    <aside className="flex h-full flex-col border-l border-white/5 bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)]/70 px-3 py-4 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Sessions</h2>
        <button
          type="button"
          onClick={onNewSession}
          className="rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_24%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] shadow-[0_10px_30px_rgba(56,189,248,0.35)]"
        >
          New
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {orderedSessions.map((session) => {
          const isActive = session.sessionId === activeSessionId;
          return (
            <div
              key={session.sessionId}
              className={`group rounded-2xl border border-white/5 p-3 text-sm text-[var(--text-primary)] transition ${
                isActive ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {renamingId === session.sessionId ? (
                <input
                  type="text"
                  defaultValue={session.title}
                  className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
                  onBlur={(e) => {
                    renameSession(session.sessionId, safeString(e.target.value, session.title));
                    setRenamingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renameSession(session.sessionId, safeString((e.target as HTMLInputElement).value, session.title));
                      setRenamingId(null);
                    }
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="flex w-full flex-col text-left"
                  onClick={() => switchSession(session.sessionId)}
                >
                  <span className="font-semibold leading-tight">{session.title}</span>
                  <span className="text-[0.7rem] text-[var(--text-tertiary)]">{session.updatedAt}</span>
                </button>
              )}
              <div className="mt-2 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  className="rounded-full px-2 py-1 text-[0.75rem] text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
                  onClick={() => setRenamingId(session.sessionId)}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="rounded-full px-2 py-1 text-[0.75rem] text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
                  onClick={() => deleteSession(session.sessionId)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default SessionSidebar;
