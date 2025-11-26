import { useMemo, useState } from "react";
import { formatDistanceToNow as baseFormatDistanceToNow } from "date-fns";
import { cn } from "@/shared/lib/cn";
import { useToronSessionStore } from "@/state/toron/toronSessionStore";

type ToronSession = {
  sessionId: string;
  title?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type FormatDistanceToNow = (date: Date | number, options?: { addSuffix?: boolean }) => string;

const safeFormatDistanceToNow: FormatDistanceToNow = (date, options) => {
  try {
    if (typeof baseFormatDistanceToNow === "function") {
      return baseFormatDistanceToNow(date, options) ?? "some time ago";
    }
  } catch (error) {
    console.error("ToronSessionSidebar: failed to format date", error);
  }
  return "some time ago";
};

function getSafeSessions(rawSessions: unknown): ToronSession[] {
  if (!rawSessions || typeof rawSessions !== "object") return [];
  const values = Object.values(rawSessions as Record<string, ToronSession | null | undefined>);
  return values
    .filter((item): item is ToronSession => !!item && typeof item === "object" && typeof (item as ToronSession).sessionId === "string")
    .map((session) => ({
      ...session,
      sessionId: session.sessionId,
      title: typeof session.title === "string" && session.title.trim() ? session.title : null,
      updatedAt: typeof session.updatedAt === "string" && session.updatedAt.trim() ? session.updatedAt : null,
      createdAt: typeof session.createdAt === "string" && session.createdAt.trim() ? session.createdAt : null,
    }));
}

function getSafeTimestampLabel(timestamp?: string | null) {
  if (!timestamp) return "Just now";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Just now";
  return safeFormatDistanceToNow(date, { addSuffix: true }) || "some time ago";
}

export function ToronSessionSidebar() {
  let storeSessions: unknown = [];
  let activeSessionId: string | null | undefined = null;
  let setActiveSession: ((id: string) => void) | undefined;
  let createSession: ((initialTitle?: string) => Promise<string>) | undefined;
  let deleteSession: ((id: string) => Promise<void>) | undefined;
  let renameSession: ((id: string, title: string) => Promise<void>) | undefined;

  try {
    const storeState = useToronSessionStore();
    storeSessions = storeState?.sessions ?? [];
    activeSessionId = storeState?.activeSessionId ?? null;
    setActiveSession = storeState?.setActiveSession;
    createSession = storeState?.createSession;
    deleteSession = storeState?.deleteSession;
    renameSession = storeState?.renameSession;
  } catch (error) {
    console.error("ToronSessionSidebar: store access failed", error);
  }

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const sessionList = useMemo(() => {
    const sessions = getSafeSessions(storeSessions);
    try {
      return [...sessions].sort((a, b) => {
        const aTime = a.updatedAt ?? a.createdAt ?? "";
        const bTime = b.updatedAt ?? b.createdAt ?? "";
        return (bTime || "").localeCompare(aTime || "");
      });
    } catch (error) {
      console.error("ToronSessionSidebar: session sort failed", error);
      return sessions;
    }
  }, [storeSessions]);

  const handleNewChat = async () => {
    if (!createSession) return;
    try {
      await createSession("New Toron Session");
    } catch (error) {
      console.error("ToronSessionSidebar: createSession failed", error);
    }
  };

  const startEdit = (sessionId: string, currentTitle: string) => {
    setEditingId(sessionId);
    setDraftTitle(currentTitle ?? "");
  };

  const commitEdit = async () => {
    if (!editingId || !renameSession) return;
    const title = draftTitle.trim() || "Untitled";
    try {
      await renameSession(editingId, title);
    } catch (error) {
      console.error("ToronSessionSidebar: renameSession failed", error);
    }
    setEditingId(null);
    setDraftTitle("");
  };

  const handleDelete = async (sessionId: string) => {
    if (!deleteSession) return;
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error("ToronSessionSidebar: deleteSession failed", error);
    }
  };

  const handleSelect = (sessionId: string) => {
    if (!setActiveSession) return;
    try {
      setActiveSession(sessionId);
    } catch (error) {
      console.error("ToronSessionSidebar: setActiveSession failed", error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Sessions</p>
        <button
          onClick={handleNewChat}
          className="rounded-lg border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_88%,transparent)] px-2 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--accent-secondary)_12%,var(--panel-elevated))]"
          type="button"
        >
          New Chat
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {sessionList.map((session) => {
          const isActive = session.sessionId === activeSessionId;
          const label = session.title ?? "Untitled";
          const lastUpdated = session.updatedAt ?? session.createdAt;
          const subtitle = getSafeTimestampLabel(lastUpdated);

          return (
            <div
              key={session.sessionId}
              className={cn(
                "group flex cursor-pointer flex-col rounded-xl border px-3 py-2 text-xs transition",
                isActive
                  ? "border-[color-mix(in_srgb,var(--accent-secondary)_60%,transparent)] bg-[color-mix(in_srgb,var(--accent-secondary)_18%,var(--panel-elevated))]"
                  : "border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] hover:bg-[color-mix(in_srgb,var(--panel-elevated)_96%,transparent)]"
              )}
              onClick={() => handleSelect(session.sessionId)}
            >
              <div className="flex items-center gap-2">
                {editingId === session.sessionId ? (
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setDraftTitle("");
                      }
                    }}
                    className="w-full rounded bg-transparent text-xs text-[var(--text-primary)] outline-none"
                  />
                ) : (
                  <div className="flex-1 truncate text-[var(--text-primary)]">{label}</div>
                )}

                <button
                  className="opacity-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(session.sessionId, label);
                  }}
                  type="button"
                >
                  ✎
                </button>
                <button
                  className="opacity-0 text-[var(--text-secondary)] hover:text-red-400 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    void handleDelete(session.sessionId);
                  }}
                  type="button"
                >
                  ✕
                </button>
              </div>
              <div className="text-[0.7rem] text-[var(--text-tertiary)]">{subtitle}</div>
            </div>
          );
        })}

        {sessionList.length === 0 && (
          <p className="px-2 pt-4 text-[0.7rem] text-[var(--text-secondary)]">
            No sessions yet. Start a new chat to begin.
          </p>
        )}
      </div>
    </div>
  );
}
