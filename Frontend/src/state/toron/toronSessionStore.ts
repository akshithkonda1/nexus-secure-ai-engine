import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ToronSession, ToronMessage } from "./toronSessionTypes";

interface ToronSessionState {
  sessions: Record<string, ToronSession>;
  activeSessionId: string | null;
  loading: boolean;
  error: string | null;

  setActiveSession: (sessionId: string) => void;
  createSession: (initialTitle?: string) => Promise<string>;
  deleteSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, title: string) => Promise<void>;

  hydrateSessions: () => Promise<void>;
  loadSessionById: (sessionId: string) => Promise<void>;

  appendMessages: (sessionId: string, messages: ToronMessage[]) => void;
  clearError: () => void;
}

const API_BASE = "/api/v1/toron";

export const useToronSessionStore = create<ToronSessionState>()(
  persist(
    (set, _get) => ({
      sessions: {},
      activeSessionId: null,
      loading: false,
      error: null,

      setActiveSession: (sessionId) => {
        set({ activeSessionId: sessionId });
      },

      createSession: async (initialTitle = "New Toron Session") => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: initialTitle }),
          });
          if (!res.ok) {
            throw new Error("Failed to create session");
          }
          const data = await res.json();
          const sessionId = data.session_id as string;

          const newSession: ToronSession = {
            sessionId,
            title: data.title ?? initialTitle,
            createdAt: data.created_at ?? undefined,
            updatedAt: data.updated_at ?? undefined,
            messages: [],
          };

          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: newSession,
            },
            activeSessionId: sessionId,
            loading: false,
          }));

          return sessionId;
        } catch (err: any) {
          set({
            loading: false,
            error: err?.message ?? "Failed to create session",
          });
          throw err;
        }
      },

      deleteSession: async (sessionId) => {
        set({ loading: true, error: null });
        try {
          await fetch(`${API_BASE}/sessions/${sessionId}`, {
            method: "DELETE",
          });
        } catch {
          // ignore server failure but still remove locally
        }

        set((state) => {
          const { [sessionId]: _, ...rest } = state.sessions;
          let nextActive = state.activeSessionId;
          if (state.activeSessionId === sessionId) {
            const remainingIds = Object.keys(rest);
            nextActive = remainingIds[0] ?? null;
          }
          return {
            sessions: rest,
            activeSessionId: nextActive,
            loading: false,
          };
        });
      },

      renameSession: async (sessionId, title) => {
        set({ loading: true, error: null });
        try {
          await fetch(`${API_BASE}/sessions/${sessionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          });
        } catch {
          // non-fatal
        }

        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;
          return {
            ...state,
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                title,
              },
            },
            loading: false,
          };
        });
      },

      hydrateSessions: async () => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/sessions`);
          if (!res.ok) throw new Error("Failed to fetch sessions");
          const data = await res.json();
          const remoteSessions = (data.sessions ?? []) as any[];

          set((state) => {
            const merged: Record<string, ToronSession> = { ...state.sessions };
            for (const s of remoteSessions) {
              const id = s.session_id as string;
              const existing = merged[id];
              merged[id] = {
                sessionId: id,
                title: s.title ?? existing?.title ?? "Untitled",
                createdAt: s.created_at ?? existing?.createdAt,
                updatedAt: s.updated_at ?? existing?.updatedAt,
                messages: existing?.messages ?? [],
              };
            }
            const active =
              state.activeSessionId || remoteSessions[0]?.session_id || null;

            return {
              sessions: merged,
              activeSessionId: active,
              loading: false,
            };
          });
        } catch (err: any) {
          set({
            loading: false,
            error: err?.message ?? "Failed to hydrate sessions",
          });
        }
      },

      loadSessionById: async (sessionId) => {
        set({ loading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
          if (!res.ok) throw new Error("Failed to load session");
          const data = await res.json();

          const loaded: ToronSession = {
            sessionId: data.session_id,
            title: data.title ?? "Untitled",
            createdAt: data.created_at ?? undefined,
            updatedAt: data.updated_at ?? undefined,
            messages: (data.messages ?? []) as ToronMessage[],
          };

          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: loaded,
            },
            activeSessionId: sessionId,
            loading: false,
          }));
        } catch (err: any) {
          set({
            loading: false,
            error: err?.message ?? "Failed to load session",
          });
        }
      },

      appendMessages: (sessionId, messages) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) return state;
          return {
            ...state,
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                messages: [...session.messages, ...messages],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "ryuzen-toron-sessions",
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
      }),
    },
  ),
);
