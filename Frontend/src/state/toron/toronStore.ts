import { create } from "zustand";

import type { ToronMessage } from "@/pages/Toron/toronTypes";

type ProjectState = {
  messages: ToronMessage[];
  initialWelcomeShown: boolean;
};

type ToronStore = {
  activeProjectId: string;
  projectStates: Record<string, ProjectState>;
  messages: ToronMessage[];
  streaming: boolean;
  loading: boolean;
  initialWelcomeShown: boolean;
  addMessage: (message: ToronMessage, projectId?: string) => void;
  updateMessage: (
    messageId: string,
    updater: (prev: ToronMessage) => ToronMessage,
    projectId?: string,
  ) => void;
  clearChat: (projectId?: string) => void;
  setProject: (projectId: string) => void;
  setStreaming: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setInitialWelcomeShown: (projectId?: string) => void;
  deleteProject: (projectId: string) => void;
};

const STORAGE_KEY = "toron:projects:v1";

const defaultProjectId = "default";

const emptyProjectState: ProjectState = {
  messages: [],
  initialWelcomeShown: false,
};

function loadProjects(): Record<string, ProjectState> {
  if (typeof window === "undefined") return { [defaultProjectId]: emptyProjectState };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { [defaultProjectId]: emptyProjectState };

    const parsed = JSON.parse(saved) as Record<string, ProjectState>;
    return Object.keys(parsed).length
      ? parsed
      : { [defaultProjectId]: emptyProjectState };
  } catch (error) {
    console.error("Failed to load toron state", error);
    return { [defaultProjectId]: emptyProjectState };
  }
}

function persistProjects(projects: Record<string, ProjectState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to persist toron state", error);
  }
}

function ensureProjectState(
  projectStates: Record<string, ProjectState>,
  projectId: string,
): Record<string, ProjectState> {
  if (projectStates[projectId]) return projectStates;
  return { ...projectStates, [projectId]: { ...emptyProjectState } };
}

export const useToronStore = create<ToronStore>((set) => {
  const initialProjects = loadProjects();
  const initialActive = Object.keys(initialProjects)[0] ?? defaultProjectId;
  const initialState = ensureProjectState(initialProjects, initialActive);
  const activeState = initialState[initialActive];

  return {
    activeProjectId: initialActive,
    projectStates: initialState,
    messages: activeState.messages,
    streaming: false,
    loading: false,
    initialWelcomeShown: activeState.initialWelcomeShown,
    addMessage: (message, projectId) => {
      set((state) => {
        const pid = projectId ?? state.activeProjectId;
        const preparedStates = ensureProjectState(state.projectStates, pid);
        const project = preparedStates[pid];
        const updatedProject = {
          ...project,
          messages: [...project.messages, message],
        };
        const projectStates = { ...preparedStates, [pid]: updatedProject };
        persistProjects(projectStates);

        return {
          projectStates,
          messages: pid === state.activeProjectId ? updatedProject.messages : state.messages,
          initialWelcomeShown:
            pid === state.activeProjectId
              ? updatedProject.initialWelcomeShown
              : state.initialWelcomeShown,
        };
      });
    },
    updateMessage: (messageId, updater, projectId) => {
      set((state) => {
        const pid = projectId ?? state.activeProjectId;
        const preparedStates = ensureProjectState(state.projectStates, pid);
        const project = preparedStates[pid];
        const updatedMessages = project.messages.map((msg) =>
          msg.id === messageId ? updater(msg) : msg,
        );
        const updatedProject = { ...project, messages: updatedMessages };
        const projectStates = { ...preparedStates, [pid]: updatedProject };
        persistProjects(projectStates);

        return {
          projectStates,
          messages: pid === state.activeProjectId ? updatedMessages : state.messages,
          initialWelcomeShown:
            pid === state.activeProjectId
              ? updatedProject.initialWelcomeShown
              : state.initialWelcomeShown,
        };
      });
    },
    clearChat: (projectId) => {
      set((state) => {
        const pid = projectId ?? state.activeProjectId;
        const preparedStates = ensureProjectState(state.projectStates, pid);
        const projectStates = {
          ...preparedStates,
          [pid]: { ...emptyProjectState },
        };
        persistProjects(projectStates);

        return {
          projectStates,
          messages:
            pid === state.activeProjectId ? projectStates[pid].messages : state.messages,
          initialWelcomeShown:
            pid === state.activeProjectId
              ? projectStates[pid].initialWelcomeShown
              : state.initialWelcomeShown,
          streaming: pid === state.activeProjectId ? false : state.streaming,
        };
      });
    },
    setProject: (projectId) => {
      set((state) => {
        const pid = projectId || defaultProjectId;
        const projectStates = ensureProjectState(state.projectStates, pid);
        const activeState = projectStates[pid];
        persistProjects(projectStates);

        return {
          activeProjectId: pid,
          projectStates,
          messages: activeState.messages,
          initialWelcomeShown: activeState.initialWelcomeShown,
          streaming: false,
        };
      });
    },
    setStreaming: (value) => set({ streaming: value }),
    setLoading: (value) => set({ loading: value }),
    setInitialWelcomeShown: (projectId) => {
      set((state) => {
        const pid = projectId ?? state.activeProjectId;
        const preparedStates = ensureProjectState(state.projectStates, pid);
        const project = preparedStates[pid];
        const updatedProject = { ...project, initialWelcomeShown: true };
        const projectStates = { ...preparedStates, [pid]: updatedProject };
        persistProjects(projectStates);

        return {
          projectStates,
          initialWelcomeShown:
            pid === state.activeProjectId ? true : state.initialWelcomeShown,
        };
      });
    },
    deleteProject: (projectId) => {
      set((state) => {
        const projectStates = { ...state.projectStates };
        delete projectStates[projectId];

        const remainingIds = Object.keys(projectStates);
        if (!remainingIds.length) {
          projectStates[defaultProjectId] = { ...emptyProjectState };
        }

        const nextActive =
          state.activeProjectId === projectId
            ? remainingIds[0] ?? defaultProjectId
            : state.activeProjectId;
        const normalizedStates = ensureProjectState(projectStates, nextActive);
        persistProjects(normalizedStates);

        const activeState = normalizedStates[nextActive];

        return {
          activeProjectId: nextActive,
          projectStates: normalizedStates,
          messages: activeState.messages,
          initialWelcomeShown: activeState.initialWelcomeShown,
          streaming: false,
        };
      });
    },
  };
});
