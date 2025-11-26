import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ToronMessage } from "@/pages/Toron/toronTypes";

type ToronState = {
  messages: ToronMessage[];
  activeSessionId: string | null;
  sessions: Record<string, ToronMessage[]>;
  addMessage: (msg: ToronMessage) => void;
  createSession: () => void;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
  clearMessages: () => void;
};

export const useToronStore = create<ToronState>()(
  persist(
    (set, get) => ({
      messages: [],
      activeSessionId: null,
      sessions: {},

      addMessage: (msg) =>
        set((state) => {
          const sessionId = state.activeSessionId!;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: [
                ...(state.sessions[sessionId] ?? []),
                msg,
              ],
            },
          };
        }),

      createSession: () =>
        set((state) => {
          const newId = crypto.randomUUID();
          return {
            activeSessionId: newId,
            sessions: { ...state.sessions, [newId]: [] },
          };
        }),

      deleteSession: (id) =>
        set((state) => {
          const s = { ...state.sessions };
          delete s[id];
          return {
            sessions: s,
            activeSessionId:
              state.activeSessionId === id ? null : state.activeSessionId,
          };
        }),

      setActiveSession: (id) =>
        set(() => ({ activeSessionId: id })),

      clearMessages: () =>
        set((state) => {
          const id = state.activeSessionId!;
          return {
            sessions: { ...state.sessions, [id]: [] },
          };
        }),
    }),

    {
      name: "toron-store",
      version: 1,
    }
  )
);
