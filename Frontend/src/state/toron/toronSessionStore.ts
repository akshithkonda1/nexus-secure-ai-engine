import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ToronMessage, ToronSession } from "@/state/toron/toronSessionTypes";
import { safeArray, safeMessage, safeSession, safeSessionRecord, safeString } from "@/shared/lib/toronSafe";
import { useToronTelemetry } from "@/hooks/useToronTelemetry";

interface ToronSessionState {
  sessions: Record<string, ToronSession>;
  activeSessionId: string | null;
  loading: boolean;
  error: string | null;
  hydrateSessions: () => Promise<void>;
  selectSession: (sessionId: string | null) => void;
  addMessage: (sessionId: string, message: ToronMessage) => void;
  appendMessages?: (sessionId: string, messages: ToronMessage[]) => void;
  updateTitle: (sessionId: string, title: string) => void;
  createSession: (initialTitle?: string) => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
}

const API_BASE = "/api/v1/toron";

const useTelemetry = useToronTelemetry;

export const useToronSessionStore = create<ToronSessionState>()(
  persist(
    (set, get) => ({
      sessions: {},
      activeSessionId: null,
      loading: false,
      error: null,

      selectSession: (sessionId) => {
        const telemetry = useTelemetry();
        try {
          set({ activeSessionId: sessionId });
        } catch (error) {
          telemetry("state_anomaly", { action: "selectSession", error: (error as Error).message });
          set({ activeSessionId: null });
        }
      },

      addMessage: (sessionId, message) => {
        const telemetry = useTelemetry();
        try {
          const safeMsg = safeMessage(message);
          set((state) => {
            const session = state.sessions[sessionId];
            if (!session) return state;
            return {
              ...state,
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  ...session,
                  messages: [...safeArray(session.messages), safeMsg],
                  updatedAt: safeMsg.timestamp,
                },
              },
            };
          });
        } catch (error) {
          telemetry("state_anomaly", { action: "addMessage", error: (error as Error).message });
        }
      },

      appendMessages: (sessionId, messages) => {
        const telemetry = useTelemetry();
        try {
          safeArray(messages, []).forEach((m) => useToronSessionStore.getState().addMessage(sessionId, m));
        } catch (error) {
          telemetry("state_anomaly", { action: "appendMessages", error: (error as Error).message });
        }
      },

      updateTitle: (sessionId, title) => {
        const telemetry = useTelemetry();
        try {
          const safeTitle = safeString(title, "Untitled Session");
          set((state) => {
            const session = state.sessions[sessionId];
            if (!session) return state;
            return {
              ...state,
              sessions: {
                ...state.sessions,
                [sessionId]: { ...session, title: safeTitle },
              },
            };
          });
        } catch (error) {
          telemetry("state_anomaly", { action: "updateTitle", error: (error as Error).message });
        }
      },

      createSession: async (initialTitle = "New Toron Session") => {
        const telemetry = useTelemetry();
        const controller = new AbortController();
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: initialTitle }),
            signal: controller.signal,
          }).catch((error: unknown) => {
            telemetry("network_error", { action: "createSession", error: (error as Error).message });
            throw error;
          });
          if (!res?.ok) throw new Error("Failed to create session");
          const data = await res.json().catch(() => ({ session_id: crypto.randomUUID(), title: initialTitle }));
          const newSession = safeSession({
            sessionId: data.session_id,
            title: data.title ?? initialTitle,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            messages: [],
          });
          set((state) => ({
            sessions: { ...state.sessions, [newSession.sessionId]: newSession },
            activeSessionId: newSession.sessionId,
            loading: false,
          }));
          return newSession.sessionId;
        } catch (error) {
          const message = (error as Error)?.message ?? "Failed to create session";
          telemetry("state_anomaly", { action: "createSession", error: message });
          set({ loading: false, error: message });
          return get().activeSessionId ?? "";
        }
      },

      deleteSession: async (sessionId) => {
        const telemetry = useTelemetry();
        const controller = new AbortController();
        set({ loading: true, error: null });
        try {
          await fetch(`${API_BASE}/sessions/${sessionId}`, { method: "DELETE", signal: controller.signal }).catch(() => undefined);
        } catch (error) {
          telemetry("network_error", { action: "deleteSession", error: (error as Error).message });
        }

        set((state) => {
          const { [sessionId]: _removed, ...rest } = state.sessions;
          const remainingIds = Object.keys(rest);
          return {
            sessions: rest,
            activeSessionId: state.activeSessionId === sessionId ? remainingIds[0] ?? null : state.activeSessionId,
            loading: false,
          };
        });
      },

      hydrateSessions: async () => {
        const telemetry = useTelemetry();
        const controller = new AbortController();
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/sessions`, { signal: controller.signal }).catch((error: unknown) => {
            telemetry("network_error", { action: "hydrateSessions", error: (error as Error).message });
            throw error;
          });
          if (!res?.ok) throw new Error("Failed to fetch sessions");
          const data = await res.json().catch(() => ({ sessions: [] }));
          const remoteSessions = safeArray(data.sessions).map(safeSession);
          set((state) => {
            const merged = { ...state.sessions } as Record<string, ToronSession>;
            for (const s of remoteSessions) {
              merged[s.sessionId] = s;
            }
            const nextActive = state.activeSessionId ?? remoteSessions[0]?.sessionId ?? null;
            return { sessions: merged, activeSessionId: nextActive, loading: false };
          });
        } catch (error) {
          const message = (error as Error)?.message ?? "Failed to hydrate sessions";
          telemetry("state_anomaly", { action: "hydrateSessions", error: message });
          set((state) => ({
            loading: false,
            error: message,
            sessions: safeSessionRecord(state.sessions),
            activeSessionId: state.activeSessionId,
          }));
        }
      },
    }),
    {
      name: "toron-session-store",
      partialize: (state) => ({
        sessions: safeSessionRecord(state.sessions),
        activeSessionId: state.activeSessionId,
      }),
    },
  ),
);
