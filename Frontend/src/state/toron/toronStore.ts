import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ToronMessage } from "@/state/toron/toronSessionTypes";
import { safeArray, safeMessage, safeSessionRecord } from "@/shared/lib/toronSafe";
import { useToronTelemetry } from "@/hooks/useToronTelemetry";

interface ToronState {
  messages: ToronMessage[];
  activeSessionId: string | null;
  sessions: Record<string, ToronMessage[]>;
  addMessage: (msg: ToronMessage) => void;
  createSession: () => void;
  deleteSession: (id: string) => void;
  setActiveSession: (id: string | null) => void;
  clearMessages: () => void;
}

const useTelemetry = useToronTelemetry;

export const useToronStore = create<ToronState>()(
  persist(
    (set, get) => ({
      messages: [],
      activeSessionId: null,
      sessions: {},

      addMessage: (msg) => {
        const telemetry = useTelemetry();
        try {
          const safeMsg = safeMessage(msg);
          set((state) => {
            const sessionId = state.activeSessionId;
            if (!sessionId) return state;
            const current = safeArray(state.sessions[sessionId], []);
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: [...current, safeMsg],
              },
              messages: [...current, safeMsg],
            };
          });
          telemetry("message_send", { sessionId: get().activeSessionId ?? "none" });
        } catch (error) {
          telemetry("state_anomaly", { action: "addMessage", error: (error as Error).message });
        }
      },

      createSession: () => {
        const telemetry = useTelemetry();
        try {
          const newId = crypto.randomUUID();
          set((state) => ({
            activeSessionId: newId,
            sessions: { ...state.sessions, [newId]: [] },
            messages: [],
          }));
        } catch (error) {
          telemetry("state_anomaly", { action: "createSession", error: (error as Error).message });
        }
      },

      deleteSession: (id) => {
        const telemetry = useTelemetry();
        try {
          set((state) => {
            const next = { ...state.sessions };
            delete next[id];
            return {
              sessions: next,
              activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
              messages: [],
            };
          });
        } catch (error) {
          telemetry("state_anomaly", { action: "deleteSession", error: (error as Error).message });
        }
      },

      setActiveSession: (id) => {
        const telemetry = useTelemetry();
        try {
          set((state) => ({
            activeSessionId: id,
            messages: safeArray(state.sessions[id ?? ""], []),
          }));
        } catch (error) {
          telemetry("state_anomaly", { action: "setActiveSession", error: (error as Error).message });
        }
      },

      clearMessages: () => {
        const telemetry = useTelemetry();
        try {
          set((state) => {
            const id = state.activeSessionId;
            if (!id) return state;
            return {
              sessions: { ...state.sessions, [id]: [] },
              messages: [],
            };
          });
        } catch (error) {
          telemetry("state_anomaly", { action: "clearMessages", error: (error as Error).message });
        }
      },
    }),
    {
      name: "toron-store",
      version: 2,
      partialize: (state) => ({
        sessions: safeSessionRecord(state.sessions),
        activeSessionId: state.activeSessionId,
      }),
    },
  ),
);
