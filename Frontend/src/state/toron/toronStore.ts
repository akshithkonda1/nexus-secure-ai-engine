import { nanoid } from "nanoid";
import { create } from "zustand";

import type { ToronMessage, ToronProject } from "@/pages/Toron/toronTypes";

type ToronStore = {
  messages: ToronMessage[];
  projects: ToronProject[];
  activeProjectId: string | null;
  projectContext: string;
  loading: boolean;
  initialWelcomeShown: boolean;
  addMessage: (msg: ToronMessage) => void;
  appendToMessage: (id: string, chunk: string) => void;
  clearChat: () => void;
  setProjectContext: (context: string) => void;
  setActiveProjectId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  createProject: (name: string, summary?: string) => void;
  deleteProject: (id: string) => void;
};

export const useToronStore = create<ToronStore>((set, get) => ({
  messages: [],
  projects: [],
  activeProjectId: null,
  projectContext: "",
  loading: false,
  initialWelcomeShown: false,

  addMessage: (msg) => {
    if (!msg) return;

    const sender =
      msg.sender === "user" || msg.sender === "toron" ? msg.sender : "toron";

    const safeMessage: ToronMessage = {
      id: msg.id ?? nanoid(),
      text: typeof msg.text === "string" ? msg.text : "",
      timestamp: msg.timestamp ?? Date.now(),
      sender,
      tokens: msg.tokens,
    };

    set((state) => {
      const projects = state.activeProjectId
        ? state.projects.map((project) =>
            project.id === state.activeProjectId
              ? {
                  ...project,
                  messages: [...(project.messages ?? []), safeMessage],
                }
              : project,
          )
        : state.projects;

      return {
        messages: [...state.messages, safeMessage],
        projects,
        initialWelcomeShown: true,
      };
    });
  },

  appendToMessage: (id, chunk) =>
    set((state) => {
      const appendChunk = (messageList: ToronMessage[]) =>
        messageList.map((message) =>
          message.id === id
            ? { ...message, text: `${message.text ?? ""}${chunk}` }
            : message,
        );

      const projects = state.activeProjectId
        ? state.projects.map((project) =>
            project.id === state.activeProjectId
              ? { ...project, messages: appendChunk(project.messages ?? []) }
              : project,
          )
        : state.projects;

      return {
        messages: appendChunk(state.messages),
        projects,
      };
    }),

  clearChat: () =>
    set((state) => {
      const projects = state.activeProjectId
        ? state.projects.map((project) =>
            project.id === state.activeProjectId
              ? { ...project, messages: [] }
              : project,
          )
        : state.projects;

      return {
        messages: [],
        projects,
        projectContext: "",
        initialWelcomeShown: false,
      };
    }),

  setProjectContext: (context) => set({ projectContext: context ?? "" }),

  setActiveProjectId: (id) => {
    const target = id ? get().projects.find((project) => project.id === id) : null;
    set({
      activeProjectId: id ?? null,
      messages: target?.messages ?? [],
      projectContext: target?.summary ?? get().projectContext ?? "",
    });
  },

  setLoading: (loading) => set({ loading }),

  createProject: (name, summary = "") =>
    set((state) => ({
      projects: [
        ...state.projects,
        { id: nanoid(), name, summary, messages: [] },
      ],
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      ...(state.activeProjectId === id
        ? { activeProjectId: null, messages: [], projectContext: "" }
        : {}),
    })),
}));
