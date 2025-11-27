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
  addMessage: (message: ToronMessage, sessionId?: string) => void;
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
  });
};

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
            const messages = [...safeArray(session.messages), safeMsg];
            return safeSession({
              ...session,
              messages,
              updatedAt: safeTimestamp(safeMsg.timestamp),
            });
          });
          return {
            sessions: updatedSessions,
            activeSessionId: targetId,
          };
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
