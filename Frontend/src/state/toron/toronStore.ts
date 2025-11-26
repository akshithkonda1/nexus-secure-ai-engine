import { nanoid } from "nanoid";
import { create } from "zustand";

import type { ToronMessage, ToronProject } from "@/pages/Toron/toronTypes";

type ToronSession = {
  id: string;
  title: string;
  messages: ToronMessage[];
  createdAt: number;
  updatedAt: number;
};

type ToronStore = {
  sessions: ToronSession[];
  activeSessionId: string | null;
  projects: ToronProject[];
  activeProjectId: string | null;
  createSession: () => string;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, message: ToronMessage) => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newTitle: string) => void;
  autoGenerateTitleFromFirstToronReply: (sessionId: string) => void;
  createProject: (name: string) => string;
  renameProject: (projectId: string, newName: string) => void;
  deleteProject: (projectId: string) => void;
  setProject: (projectId: string) => void;
};

const initialProjectId = nanoid();

export const useToronStore = create<ToronStore>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  projects: [{ id: initialProjectId, name: "General" }],
  activeProjectId: initialProjectId,

  createSession: () => {
    const id = nanoid();

    const session: ToronSession = {
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

  createProject: (name) => {
    const id = nanoid();
    const project: ToronProject = { id, name };

    set((state) => ({
      projects: [...state.projects, project],
      activeProjectId: id,
    }));

    return id;
  },

  renameProject: (projectId, newName) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId ? { ...project, name: newName } : project,
      ),
    }));
  },

  deleteProject: (projectId) => {
    set((state) => {
      const remaining = state.projects.filter((project) => project.id !== projectId);
      const fallbackProjectId =
        state.activeProjectId === projectId
          ? remaining[0]?.id ?? null
          : state.activeProjectId;

      return {
        projects: remaining,
        activeProjectId: fallbackProjectId,
      };
    });
  },

  setProject: (projectId) => {
    const projectExists = get().projects.some((project) => project.id === projectId);
    if (!projectExists) return;

    set({ activeProjectId: projectId });
  },
}));
