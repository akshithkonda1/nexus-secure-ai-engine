import { nanoid } from "nanoid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ToronMessage, ToronProject, ToronSender } from "@/pages/Toron/toronTypes";

export const DEFAULT_PROJECT: ToronProject = { id: "toron-default", name: "Personal Space" };

type MessagePayload = Partial<ToronMessage> & { sender: ToronSender; text: string };

type ToronState = {
  messages: ToronMessage[];
  projects: ToronProject[];
  activeProjectId: string | null;
  activeSessionId: string | null;
  welcomeShown: boolean;
  streaming: boolean;
  loading: boolean;
  projectMessages: Record<string, ToronMessage[]>;
};

type ToronActions = {
  addMessage: {
    (message: MessagePayload): void;
    (sessionId: string, message: MessagePayload): void;
  };
  appendToMessage: (projectId: string, messageId: string, chunk: string) => void;
  clearChat: () => void;
  createProject: (name: string) => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  setProject: (id: string | null) => void;
  setStreaming: (streaming: boolean) => void;
  setLoading: (loading: boolean) => void;
  autoGenerateTitleFromFirstToronReply: (sessionId: string) => void;
};

export const useToronStore = create<ToronState & ToronActions>()(
  persist(
    (set, get) => ({
      messages: [],
      projects: [DEFAULT_PROJECT],
      activeProjectId: DEFAULT_PROJECT.id,
      activeSessionId: DEFAULT_PROJECT.id,
      welcomeShown: true,
      streaming: false,
      loading: false,
      projectMessages: { [DEFAULT_PROJECT.id]: [] },

      addMessage: (sessionOrMessage: string | MessagePayload, maybeMessage?: MessagePayload) => {
        const sessionId = typeof sessionOrMessage === "string"
          ? sessionOrMessage
          : get().activeProjectId ?? DEFAULT_PROJECT.id;

        const message = typeof sessionOrMessage === "string" ? maybeMessage : sessionOrMessage;
        if (!message) return;

        const msg: ToronMessage = {
          id: message.id ?? nanoid(),
          sender: message.sender,
          text: message.text ?? "",
          timestamp: message.timestamp ?? Date.now(),
        };

        set((state) => ({
          messages: sessionId === (state.activeProjectId ?? DEFAULT_PROJECT.id)
            ? [...state.messages, msg]
            : state.messages,
          projectMessages: {
            ...state.projectMessages,
            [sessionId]: [...(state.projectMessages[sessionId] ?? []), msg],
          },
          welcomeShown: message.sender === "user" ? false : state.welcomeShown,
        }));
      },

      appendToMessage: (projectId, messageId, chunk) =>
        set((state) => {
          const targetProjectId = projectId ?? DEFAULT_PROJECT.id;
          const updateList = (list: ToronMessage[]) => {
            if (!list.length) return list;
            const targetIndex = list.findIndex((message) => message.id === messageId);
            if (targetIndex === -1) return list;

            const updated = [...list];
            updated[targetIndex] = {
              ...updated[targetIndex],
              text: `${updated[targetIndex].text}${chunk}`,
            };
            return updated;
          };

          const updatedProjectMessages = updateList(state.projectMessages[targetProjectId] ?? []);

          return {
            messages:
              state.activeProjectId === targetProjectId
                ? updateList(state.messages)
                : state.messages,
            projectMessages: {
              ...state.projectMessages,
              [targetProjectId]: updatedProjectMessages,
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
            activeSessionId: project.id,
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
            activeSessionId: nextActive,
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
            activeSessionId: target,
            messages,
            welcomeShown: messages.length === 0 ? true : state.welcomeShown,
            streaming: false,
          };
        }),

      setStreaming: (streaming) => set({ streaming }),

      setLoading: (loading) => set({ loading }),

      autoGenerateTitleFromFirstToronReply: (sessionId) =>
        set((state) => {
          const messages = state.projectMessages[sessionId] ?? [];
          const firstReply = messages.find((message) => message.sender === "toron");
          const existingProject = state.projects.find((project) => project.id === sessionId);

          if (!firstReply || !existingProject) return state;

          const trimmed = firstReply.text.trim();
          if (!trimmed) return state;

          const derivedTitle = trimmed.length > 60 ? `${trimmed.slice(0, 57)}...` : trimmed;

          return {
            projects: state.projects.map((project) =>
              project.id === sessionId ? { ...project, name: derivedTitle } : project,
            ),
          };
        }),
    }),
    {
      name: "toron-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
