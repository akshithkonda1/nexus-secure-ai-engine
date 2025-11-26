import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ToronMessage, ToronProject, ToronSender } from "@/pages/Toron/toronTypes";

const DEFAULT_PROJECT: ToronProject = { id: "toron-default", name: "Personal Space" };

type ToronState = {
  messages: ToronMessage[];
  projects: ToronProject[];
  activeProjectId: string | null;
  welcomeShown: boolean;
  streaming: boolean;
  loading: boolean;
  projectMessages: Record<string, ToronMessage[]>;
};

type ToronActions = {
  addMessage: (message: Partial<ToronMessage> & { sender: ToronSender; text: string }) => void;
  appendToLastMessage: (chunk: string) => void;
  clearChat: () => void;
  createProject: (name: string) => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  setProject: (id: string | null) => void;
  setStreaming: (streaming: boolean) => void;
  setLoading: (loading: boolean) => void;
};

export const useToronStore = create<ToronState & ToronActions>()(
  persist(
    (set, get) => ({
      messages: [],
      projects: [DEFAULT_PROJECT],
      activeProjectId: DEFAULT_PROJECT.id,
      welcomeShown: true,
      streaming: false,
      loading: false,
      projectMessages: { [DEFAULT_PROJECT.id]: [] },

      addMessage: (message) => {
        const projectId = get().activeProjectId ?? DEFAULT_PROJECT.id;
        const msg: ToronMessage = {
          id: message.id ?? nanoid(),
          sender: message.sender,
          text: message.text ?? "",
          timestamp: message.timestamp ?? Date.now(),
        };

        set((state) => ({
          messages: [...state.messages, msg],
          projectMessages: {
            ...state.projectMessages,
            [projectId]: [...(state.projectMessages[projectId] ?? []), msg],
          },
          welcomeShown: message.sender === "user" ? false : state.welcomeShown,
        }));
      },

      appendToLastMessage: (chunk) =>
        set((state) => {
          const projectId = state.activeProjectId ?? DEFAULT_PROJECT.id;
          const updateList = (list: ToronMessage[]) => {
            if (!list.length) return list;
            const updated = [...list];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = {
              ...updated[lastIndex],
              text: `${updated[lastIndex].text}${chunk}`,
            };
            return updated;
          };

          return {
            messages: updateList(state.messages),
            projectMessages: {
              ...state.projectMessages,
              [projectId]: updateList(state.projectMessages[projectId] ?? []),
            },
          };
        }),

      clearChat: () =>
        set((state) => {
          const projectId = state.activeProjectId ?? DEFAULT_PROJECT.id;
          return {
            messages: [],
            projectMessages: { ...state.projectMessages, [projectId]: [] },
            streaming: false,
            loading: false,
            welcomeShown: true,
          };
        }),

      createProject: (name) =>
        set((state) => {
          const project: ToronProject = { id: nanoid(), name: name.trim() || "Untitled" };
          return {
            projects: [...state.projects, project],
            activeProjectId: project.id,
            messages: [],
            projectMessages: { ...state.projectMessages, [project.id]: [] },
            welcomeShown: true,
          };
        }),

      renameProject: (id, name) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, name: name.trim() || project.name } : project,
          ),
        })),

      deleteProject: (id) =>
        set((state) => {
          const nextProjects = state.projects.filter((project) => project.id !== id);
          const projectMessages = { ...state.projectMessages };
          delete projectMessages[id];

          const nextActive =
            state.activeProjectId === id
              ? nextProjects[0]?.id ?? DEFAULT_PROJECT.id
              : state.activeProjectId ?? DEFAULT_PROJECT.id;

          const ensuredProjects = nextProjects.length ? nextProjects : [DEFAULT_PROJECT];
          if (!projectMessages[nextActive]) {
            projectMessages[nextActive] = [];
          }

          return {
            projects: ensuredProjects,
            activeProjectId: nextActive,
            messages: projectMessages[nextActive],
            projectMessages,
            welcomeShown: projectMessages[nextActive].length === 0,
            streaming: false,
            loading: false,
          };
        }),

      setProject: (id) =>
        set((state) => {
          const target = id ?? DEFAULT_PROJECT.id;
          const messages = state.projectMessages[target] ?? [];
          return {
            activeProjectId: target,
            messages,
            welcomeShown: messages.length === 0 ? true : state.welcomeShown,
            streaming: false,
          };
        }),

      setStreaming: (streaming) => set({ streaming }),

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: "toron-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
