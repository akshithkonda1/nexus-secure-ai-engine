import { nanoid } from "nanoid";
import { create } from "zustand";

import type { ToronMessage, ToronProject } from "@/pages/Toron/toronTypes";

type ToronStore = {
  messages: ToronMessage[];
  projects: ToronProject[];
  activeProjectId: string | null;
  loading: boolean;
  initialWelcomeShown: boolean;
  addMessage: (
    msg: Omit<ToronMessage, "id" | "timestamp"> &
      Partial<Pick<ToronMessage, "id" | "timestamp">>,
  ) => void;
  simulateToronReply: (text: string) => void;
  clearChat: () => void;
  setProject: (id: string) => void;
  createProject: (name: string) => void;
  deleteProject: (id: string) => void;
};

export const useToronStore = create<ToronStore>((set, get) => ({
  messages: [],
  projects: [],
  activeProjectId: null,
  loading: false,
  initialWelcomeShown: false,

  addMessage: (msg) => {
    const newMsg: ToronMessage = { id: nanoid(), timestamp: Date.now(), ...msg };

    set((state) => {
      const updatedProjects = state.activeProjectId
        ? state.projects.map((p) =>
            p.id === state.activeProjectId
              ? { ...p, messages: [...p.messages, newMsg] }
              : p,
          )
        : state.projects;

      return {
        messages: [...state.messages, newMsg],
        projects: updatedProjects,
        initialWelcomeShown: true,
      };
    });
  },

  simulateToronReply: (text) => {
    set({ loading: true });

    let buffer = "";
    const reply = `Toron received: "${text}"`;

    reply.split("").forEach((char, i) => {
      setTimeout(() => {
        buffer += char;

        if (i === reply.length - 1) {
          const toronMessage: ToronMessage = {
            id: nanoid(),
            sender: "toron",
            text: buffer,
            timestamp: Date.now(),
          };

          set((state) => {
            const updatedProjects = state.activeProjectId
              ? state.projects.map((p) =>
                  p.id === state.activeProjectId
                    ? { ...p, messages: [...p.messages, toronMessage] }
                    : p,
                )
              : state.projects;

            return {
              messages: [...state.messages, toronMessage],
              projects: updatedProjects,
              loading: false,
            };
          });
        }
      }, i * 25);
    });
  },

  clearChat: () => {
    const activeProjectId = get().activeProjectId;

    set((state) => ({
      messages: [],
      projects: activeProjectId
        ? state.projects.map((project) =>
            project.id === activeProjectId
              ? { ...project, messages: [] }
              : project,
          )
        : state.projects,
      initialWelcomeShown: false,
    }));
  },

  setProject: (id) => {
    const target = get().projects.find((p) => p.id === id);
    set({
      activeProjectId: id,
      messages: target ? target.messages : [],
    });
  },

  createProject: (name) =>
    set((state) => ({
      projects: [
        ...state.projects,
        { id: nanoid(), name, messages: [] },
      ],
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      ...(state.activeProjectId === id
        ? { activeProjectId: null, messages: [] }
        : {}),
    })),
}));
