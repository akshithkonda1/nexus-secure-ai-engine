import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ToronMessage, ToronSession } from "@/state/toron/toronSessionTypes";
import { safeArray, safeMessage, safeSession, safeString, safeTimestamp } from "@/shared/lib/toronSafe";

interface ToronStore {
  sessions: ToronSession[];
  activeSessionId: string | null;
  createSession: (title?: string) => string;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  addMessage: (message: ToronMessage, sessionId?: string) => void;
  removeMessage: (messageId: string, sessionId?: string) => void;
  getActiveSession: () => ToronSession | null;
}

const createEmptySession = (title?: string): ToronSession => {
  const now = new Date().toISOString();
  return safeSession({
    sessionId: crypto.randomUUID(),
    title: safeString(title, "New Chat"),
    createdAt: now,
    updatedAt: now,
    messages: [],
    titleAutoLocked: false,
    firstMessageTitle: null,
  });
};

const generateTitleFromMessage = (text: string) =>
  text
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 8)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");

export const useToronStore = create<ToronStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      createSession: (title) => {
        const nextSession = createEmptySession(title);
        set((state) => ({
          sessions: [...safeArray(state.sessions), nextSession],
          activeSessionId: nextSession.sessionId,
        }));
        return nextSession.sessionId;
      },

      switchSession: (id) => {
        const exists = safeArray(get().sessions).some((s) => s.sessionId === id);
        set({ activeSessionId: exists ? id : null });
      },

      renameSession: (id, title) => {
        const normalizedTitle = safeString(title, "Untitled Session");
        set((state) => ({
          sessions: safeArray(state.sessions).map((session) =>
            session.sessionId === id
              ? safeSession({
                  ...session,
                  title: normalizedTitle,
                  updatedAt: new Date().toISOString(),
                  titleAutoLocked: true,
                })
              : session,
          ),
        }));
      },

      deleteSession: (id) => {
        set((state) => {
          const remaining = safeArray(state.sessions).filter((session) => session.sessionId !== id);
          const nextActive = state.activeSessionId === id ? remaining[0]?.sessionId ?? null : state.activeSessionId;
          return {
            sessions: remaining,
            activeSessionId: nextActive,
          };
        });
      },

      addMessage: (message, sessionId) => {
        const targetId = sessionId ?? get().activeSessionId;
        if (!targetId) return;
        const safeMsg = safeMessage(message);
        set((state) => {
          const updatedSessions = safeArray(state.sessions).map((session) => {
            if (session.sessionId !== targetId) return session;
            const isFirstUserMessage = safeArray(session.messages).length === 0 && safeMsg.role === "user";
            const messages = [...safeArray(session.messages), safeMsg];
            const shouldGenerateTitle = !session.titleAutoLocked && isFirstUserMessage;
            const nextTitle = shouldGenerateTitle ? generateTitleFromMessage(safeMsg.content) || session.title : session.title;
            return safeSession({
              ...session,
              messages,
              updatedAt: safeTimestamp(safeMsg.timestamp),
              title: nextTitle,
              titleAutoLocked: session.titleAutoLocked || shouldGenerateTitle,
              firstMessageTitle: shouldGenerateTitle ? nextTitle : session.firstMessageTitle ?? null,
            });
          });
          return {
            sessions: updatedSessions,
            activeSessionId: targetId,
          };
        });
      },

      removeMessage: (messageId, sessionId) => {
        const targetId = sessionId ?? get().activeSessionId;
        if (!targetId) return;
        set((state) => {
          const updatedSessions = safeArray(state.sessions).map((session) => {
            if (session.sessionId !== targetId) return session;
            const filtered = safeArray(session.messages).filter((message) => message.id !== messageId);
            return safeSession({ ...session, messages: filtered });
          });
          return { sessions: updatedSessions, activeSessionId: targetId };
        });
      },

      getActiveSession: () => {
        const { activeSessionId, sessions } = get();
        if (!activeSessionId) return null;
        const found = safeArray(sessions).find((session) => session.sessionId === activeSessionId);
        return found ? safeSession(found) : null;
      },
    }),
    {
      name: "toron-store",
    },
  ),
);
