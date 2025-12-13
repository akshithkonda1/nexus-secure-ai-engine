import { useEffect, useMemo, useRef, useState } from "react";

import { safeArray, safeString } from "@/shared/lib/toronSafe";
import { useToronStore } from "@/state/toron/toronStore";
import { useToronUIStore } from "@/state/toron/toronUIStore";

const formatTimestamp = (value?: string | null) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return value;
  }
};

interface SessionsToggleProps {
  className?: string;
}

export function SessionsToggle({ className = "" }: SessionsToggleProps) {
  const { sessionsWidgetState, setSessionsWidgetState } = useToronUIStore();
  const [hovered, setHovered] = useState(false);

  const baseClasses =
    "z-30 flex items-center gap-2 rounded-full backdrop-blur-lg transition duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_70%,transparent)] motion-reduce:transform-none motion-reduce:transition-none";

  if (sessionsWidgetState === "hidden") {
    return (
      <button
        type="button"
        aria-label="Show sessions"
        onClick={() => setSessionsWidgetState("collapsed")}
        className={`${baseClasses} ${className} bg-[var(--panel-elevated)]/40 px-3 py-2 text-xs text-[var(--text-secondary)] shadow-[0_6px_20px_rgba(0,0,0,0.18)] hover:bg-[color-mix(in_srgb,var(--panel-elevated)_70%,transparent)]`}
      >
        <span className="sr-only">Open sessions widget</span>
        <span aria-hidden className="h-1.5 w-10 rounded-full bg-[var(--text-secondary)]/60" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Open sessions"
      onClick={() => setSessionsWidgetState("expanded")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`${baseClasses} ${className} bg-[var(--panel-elevated)]/70 px-3 py-2 text-sm text-[var(--text-primary)] shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)]`}
    >
      <span
        className={`h-2 w-2 rounded-full transition-colors duration-200 ${hovered ? "bg-[var(--accent)]" : "bg-[var(--text-secondary)]/70"}`}
      >
        <span className="toron-session-breath pointer-events-none block h-full w-full rounded-full" aria-hidden />
      </span>
      <span className="font-semibold">Sessions</span>
    </button>
  );
}

interface SessionsWidgetProps {
  className?: string;
}

export function SessionsWidget({ className = "" }: SessionsWidgetProps) {
  const { sessionsWidgetState, setSessionsWidgetState, sessionsScrollTop, setSessionsScrollTop } = useToronUIStore();
  const { sessions, activeSessionId, switchSession, renameSession, deleteSession, createSession } = useToronStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const orderedSessions = useMemo(
    () => safeArray(sessions, []).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")),
    [sessions],
  );

  useEffect(() => {
    if (sessionsWidgetState === "expanded" && listRef.current) {
      listRef.current.scrollTop = sessionsScrollTop;
    }
  }, [sessionsWidgetState, sessionsScrollTop]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sessionsWidgetState !== "expanded") return;
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setSessionsWidgetState("collapsed");
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && sessionsWidgetState === "expanded") {
        event.stopPropagation();
        setSessionsWidgetState("collapsed");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [sessionsWidgetState, setSessionsWidgetState]);

  if (sessionsWidgetState === "hidden" || sessionsWidgetState === "collapsed") return null;

  return (
    <div
      ref={containerRef}
      className={`z-40 w-80 max-w-[85vw] overflow-hidden rounded-3xl bg-[color-mix(in_srgb,var(--panel-elevated)_88%,transparent)] shadow-[0_14px_42px_rgba(0,0,0,0.32)] backdrop-blur-xl transition duration-150 ease-out motion-reduce:transform-none motion-reduce:transition-none ${className}`}
      style={{ transform: "translateY(4px)", opacity: 1 }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-[var(--text-primary)]">
        <div className="flex flex-col">
          <span className="text-xs text-[var(--text-secondary)]">Context memory</span>
          <span className="text-sm font-semibold">Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchSession(createSession("New Toron Session"))}
            className="rounded-full bg-[color-mix(in_srgb,var(--accent)_26%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] shadow-[0_10px_26px_rgba(56,189,248,0.35)] transition hover:bg-[color-mix(in_srgb,var(--accent)_40%,transparent)]"
          >
            New
          </button>
          <button
            type="button"
            aria-label="Collapse sessions"
            onClick={() => setSessionsWidgetState("hidden")}
            className="rounded-full px-2 py-1 text-xs text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_70%,transparent)]"
          >
            Hide
          </button>
        </div>
      </div>
      <div
        ref={listRef}
        className="max-h-[60vh] overflow-y-auto px-4 pb-4"
        onScroll={(event) => setSessionsScrollTop((event.target as HTMLDivElement).scrollTop)}
      >
        <div className="space-y-2">
          {orderedSessions.map((session) => {
            const isActive = session.sessionId === activeSessionId;
            const isEmpty = !safeArray(session.messages).length;
            const isRenaming = renamingId === session.sessionId;
            return (
              <div
                key={session.sessionId}
                className={`group rounded-2xl border border-white/5 p-3 text-sm text-[var(--text-primary)] transition ${
                  isActive ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {isRenaming ? (
                    <div className="flex-1 text-left">
                      <input
                        type="text"
                        autoFocus
                        value={renameDraft}
                        onChange={(event) => setRenameDraft(event.target.value)}
                        onBlur={() => {
                          renameSession(session.sessionId, safeString(renameDraft, session.title));
                          setRenamingId(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            renameSession(session.sessionId, safeString(renameDraft, session.title));
                            setRenamingId(null);
                          }
                          if (event.key === "Escape") {
                            setRenamingId(null);
                            setRenameDraft(session.title);
                          }
                        }}
                        className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm text-[var(--text-primary)] outline-none"
                      />
                      <span className="mt-1 block text-[0.7rem] text-[var(--text-tertiary)]">{formatTimestamp(session.updatedAt)}</span>
                      {isEmpty && (
                        <span className="mt-1 block text-[0.7rem] text-[var(--text-tertiary)]">Draft</span>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="flex-1 text-left"
                      onClick={() => switchSession(session.sessionId)}
                    >
                      <span className="block font-semibold leading-tight">{session.title}</span>
                      <span className="text-[0.7rem] text-[var(--text-tertiary)]">
                        {formatTimestamp(session.updatedAt)}
                      </span>
                      {isEmpty && (
                        <span className="mt-1 block text-[0.7rem] text-[var(--text-tertiary)]">Draft</span>
                      )}
                    </button>
                  )}
                  <div className="flex flex-col gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      className="rounded-full px-2 py-1 text-[0.75rem] text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_70%,transparent)]"
                      onClick={() => {
                        setRenamingId(session.sessionId);
                        setRenameDraft(session.title);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="rounded-full px-2 py-1 text-[0.75rem] text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_70%,transparent)]"
                      onClick={() => deleteSession(session.sessionId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
