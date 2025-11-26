import { useState } from "react";
import { useToronSessionStore } from "@/state/toron/toronSessionStore";
import { cn } from "@/shared/lib/cn";
import { formatDistanceToNow } from "date-fns";

export function ToronSessionSidebar() {
  const {
    sessions,
    activeSessionId,
    setActiveSession,
    createSession,
    deleteSession,
    renameSession,
  } = useToronSessionStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const sessionList = Object.values(sessions).sort((a, b) => {
    const aTime = a.updatedAt ?? a.createdAt ?? "";
    const bTime = b.updatedAt ?? b.createdAt ?? "";
    return (bTime || "").localeCompare(aTime || "");
  });

  const handleNewChat = async () => {
    await createSession("New Toron Session");
  };

  const startEdit = (sessionId: string, currentTitle: string) => {
    setEditingId(sessionId);
    setDraftTitle(currentTitle);
  };

  const commitEdit = async () => {
    if (!editingId) return;
    const title = draftTitle.trim() || "Untitled";
    await renameSession(editingId, title);
    setEditingId(null);
    setDraftTitle("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
          Sessions
        </p>
        <button
          onClick={handleNewChat}
          className="rounded-lg border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_88%,transparent)] px-2 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--accent-secondary)_12%,var(--panel-elevated))]"
        >
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {sessionList.map((session) => {
          const isActive = session.sessionId === activeSessionId;
          const label = session.title || "Untitled";
          const lastUpdated = session.updatedAt || session.createdAt;
          const subtitle = lastUpdated
            ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })
            : "Just now";

          return (
            <div
              key={session.sessionId}
              className={cn(
                "group flex flex-col rounded-xl border px-3 py-2 text-xs cursor-pointer transition",
                isActive
                  ? "border-[color-mix(in_srgb,var(--accent-secondary)_60%,transparent)] bg-[color-mix(in_srgb,var(--accent-secondary)_18%,var(--panel-elevated))]"
                  : "border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] hover:bg-[color-mix(in_srgb,var(--panel-elevated)_96%,transparent)]"
              )}
              onClick={() => setActiveSession(session.sessionId)}
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
                    className="w-full rounded bg-transparent text-[var(--text-primary)] outline-none text-xs"
                  />
                ) : (
                  <div className="flex-1 truncate text-[var(--text-primary)]">
                    {label}
                  </div>
                )}

                <button
                  className="opacity-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(session.sessionId, label);
                  }}
                >
                  ✎
                </button>
                <button
                  className="opacity-0 text-[var(--text-secondary)] hover:text-red-400 group-hover:opacity-100"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteSession(session.sessionId);
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="text-[0.7rem] text-[var(--text-tertiary)]">
                {subtitle}
              </div>
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
