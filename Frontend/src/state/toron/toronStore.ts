import { create } from "zustand";
import { nanoid } from "nanoid";

export const useToronStore = create((set, get) => ({
  sessions: [],
  activeSessionId: null,

  createSession: () => {
    const id = nanoid();

    const session = {
      id,
      title: "New Session",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      sessions: [...state.sessions, session],
      activeSessionId: id,
    }));

    return id;
  },

  setActiveSession: (id) => {
    set(() => ({ activeSessionId: id }));
  },

  addMessage: (sessionId, message) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, message],
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
  },

  deleteSession: (sessionId) => {
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== sessionId),

      activeSessionId:
        state.activeSessionId === sessionId ? null : state.activeSessionId,
    }));
  },

  renameSession: (sessionId, newTitle) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, title: newTitle } : s
      ),
    }));
  },

  autoGenerateTitleFromFirstToronReply: (sessionId) => {
    const state = get();
    const session = state.sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const firstToron = session.messages.find((m) => m.sender === "toron");
    if (!firstToron) return;

    const words = firstToron.text.split(" ").slice(0, 8);
    const title = words.join(" ") || "Conversation";

    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, title } : s
      ),
    }));
  },
}));
