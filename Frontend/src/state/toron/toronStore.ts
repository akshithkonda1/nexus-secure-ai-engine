import { nanoid } from "nanoid";
import { create } from "zustand";

import { ProjectsAPI } from "@/lib/api/projectsApi";
import type {
  PersonaMode,
  ToronMemory,
  ToronMessage,
  ToronProject,
  ToronProjectMetadata,
} from "@/pages/Toron/toronTypes";

const STORAGE_KEY = "toron:projects:v3";
const ACTIVE_KEY = "toron:active";

const defaultMetadata: ToronProjectMetadata = {
  goals: "",
  personaMode: "default",
  keywords: [],
};

const defaultMemory: ToronMemory = { shortTerm: [], longTerm: [] };

const createProjectTemplate = (name: string): ToronProject => ({
  id: nanoid(),
  name,
  messages: [],
  metadata: { ...defaultMetadata },
  memory: { ...defaultMemory },
  updatedAt: Date.now(),
});

const loadFromStorage = () => {
  if (typeof localStorage === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const active = localStorage.getItem(ACTIVE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, ToronProject>;
      return {
        projects: parsed,
        activeProjectId: active && parsed[active] ? active : Object.keys(parsed)[0] ?? null,
      };
    }
  } catch (error) {
    console.warn("Failed to load Toron projects", error);
  }
  return null;
};

const persistState = (projects: Record<string, ToronProject>, activeProjectId: string | null) => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    if (activeProjectId) {
      localStorage.setItem(ACTIVE_KEY, activeProjectId);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  } catch (error) {
    console.warn("Failed to persist Toron projects", error);
  }
};

type ToronStore = {
  projects: Record<string, ToronProject>;
  activeProjectId: string | null;
  messages: ToronMessage[];
  memory: ToronMemory;
  loading: boolean;
  initialWelcomeShown: boolean;
  createProject: (name?: string) => string;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  switchProject: (id: string) => void;
  addMessage: (
    msg: Omit<ToronMessage, "id" | "timestamp"> & Partial<Pick<ToronMessage, "id" | "timestamp">>,
  ) => string | null;
  appendToMessage: (id: string, chunk: string) => void;
  clearChat: () => void;
  setLoading: (state: boolean) => void;
  updateMetadata: (id: string, metadata: Partial<ToronProjectMetadata>) => void;
  syncProjectToServer: (id?: string) => Promise<void>;
  loadProjectFromServer: (id: string) => Promise<void>;
};

const storedState = loadFromStorage();
const bootstrapProject = storedState?.projects && Object.keys(storedState.projects).length > 0
  ? storedState.projects[storedState.activeProjectId ?? Object.keys(storedState.projects)[0]]
  : createProjectTemplate("New Project");

const initialProjects = storedState?.projects ?? { [bootstrapProject.id]: bootstrapProject };
const initialActiveProjectId = storedState?.activeProjectId ?? bootstrapProject.id;
const initialMessages = initialProjects[initialActiveProjectId]?.messages ?? [];
const initialMemory = initialProjects[initialActiveProjectId]?.memory ?? { ...defaultMemory };

export const useToronStore = create<ToronStore>((set, get) => ({
  projects: initialProjects,
  activeProjectId: initialActiveProjectId,
  messages: initialMessages,
  memory: initialMemory,
  loading: false,
  initialWelcomeShown: initialMessages.some((msg) => msg.sender === "user"),

  createProject: (name = "Untitled Project") => {
    const project = createProjectTemplate(name.trim() || "Untitled Project");
    set((state) => {
      const projects = { ...state.projects, [project.id]: project };
      persistState(projects, project.id);
      return {
        projects,
        activeProjectId: project.id,
        messages: project.messages,
        memory: project.memory,
      };
    });
    return project.id;
  },

  renameProject: (id, name) => {
    if (!name.trim()) return;
    set((state) => {
      if (!state.projects[id]) return state;
      const projects = {
        ...state.projects,
        [id]: { ...state.projects[id], name: name.trim(), updatedAt: Date.now() },
      };
      persistState(projects, state.activeProjectId);
      return { projects };
    });
  },

  deleteProject: (id) => {
    set((state) => {
      const projects = { ...state.projects };
      delete projects[id];

      let activeProjectId = state.activeProjectId;
      if (activeProjectId === id) {
        const nextId = Object.keys(projects)[0] ?? createProjectTemplate("New Project").id;
        if (!projects[nextId]) {
          const fallback = createProjectTemplate("New Project");
          projects[fallback.id] = fallback;
          activeProjectId = fallback.id;
        } else {
          activeProjectId = nextId;
        }
      }

      const activeProject = activeProjectId ? projects[activeProjectId] : null;
      persistState(projects, activeProjectId ?? null);
      return {
        projects,
        activeProjectId: activeProjectId ?? null,
        messages: activeProject?.messages ?? [],
        memory: activeProject?.memory ?? { ...defaultMemory },
        initialWelcomeShown: false,
      };
    });
  },

  switchProject: (id) => {
    const project = get().projects[id];
    if (!project) return;
    set({
      activeProjectId: id,
      messages: project.messages,
      memory: project.memory,
      initialWelcomeShown: project.messages.some((msg) => msg.sender === "user"),
    });
    persistState(get().projects, id);
  },

  addMessage: (msg) => {
    const id = msg.id ?? nanoid();
    const timestamp = msg.timestamp ?? Date.now();
    const message: ToronMessage = { ...msg, id, timestamp };

    set((state) => {
      const activeProject = state.activeProjectId ? state.projects[state.activeProjectId] : null;
      if (!activeProject) return state;
      const updatedProject = {
        ...activeProject,
        messages: [...activeProject.messages, message],
        updatedAt: Date.now(),
      };
      const projects = { ...state.projects, [activeProject.id]: updatedProject };
      persistState(projects, state.activeProjectId);
      return {
        projects,
        messages: [...state.messages, message],
        initialWelcomeShown: state.initialWelcomeShown || message.sender === "user",
      };
    });

    void get().syncProjectToServer();
    return id;
  },

  appendToMessage: (id, chunk) => {
    set((state) => {
      const activeProject = state.activeProjectId ? state.projects[state.activeProjectId] : null;
      if (!activeProject) return state;
      const messages = state.messages.map((m) => (m.id === id ? { ...m, text: `${m.text}${chunk}` } : m));
      const projectMessages = activeProject.messages.map((m) => (m.id === id ? { ...m, text: `${m.text}${chunk}` } : m));

      const projects = {
        ...state.projects,
        [activeProject.id]: { ...activeProject, messages: projectMessages },
      };
      persistState(projects, state.activeProjectId);
      return { messages, projects };
    });
  },

  clearChat: () => {
    set((state) => {
      const activeProject = state.activeProjectId ? state.projects[state.activeProjectId] : null;
      if (!activeProject) return state;
      const clearedProject = { ...activeProject, messages: [], memory: { ...activeProject.memory } };
      const projects = { ...state.projects, [activeProject.id]: clearedProject };
      persistState(projects, state.activeProjectId);
      return {
        messages: [],
        memory: clearedProject.memory,
        projects,
        initialWelcomeShown: false,
      };
    });
  },

  setLoading: (stateValue) => set({ loading: stateValue }),

  updateMetadata: (id, metadata) => {
    set((state) => {
      const project = state.projects[id];
      if (!project) return state;
      const updatedProject = {
        ...project,
        metadata: { ...project.metadata, ...metadata },
        updatedAt: Date.now(),
      };
      const projects = { ...state.projects, [id]: updatedProject };
      persistState(projects, state.activeProjectId);
      return { projects };
    });
  },

  syncProjectToServer: async (id) => {
    const projectId = id ?? get().activeProjectId;
    if (!projectId) return;
    const project = get().projects[projectId];
    if (!project) return;
    try {
      await ProjectsAPI.update(project.id, {
        name: project.name,
        metadata: project.metadata,
      });
      await ProjectsAPI.saveMessages(project.id, project.messages);
      await ProjectsAPI.saveMemory(project.id, project.memory);
    } catch (error) {
      console.debug("Toron sync skipped", error);
    }
  },

  loadProjectFromServer: async (id) => {
    try {
      const { data } = await ProjectsAPI.load(id);
      if (!data) return;
      const inbound: ToronProject = {
        id: data.id ?? id,
        name: data.name ?? "Synced Project",
        messages: data.messages ?? [],
        metadata: { ...defaultMetadata, ...(data.metadata as ToronProjectMetadata) },
        memory: data.memory ?? { ...defaultMemory },
        updatedAt: Date.now(),
      };
      set((state) => {
        const projects = { ...state.projects, [id]: inbound };
        const isActive = state.activeProjectId === id;
        persistState(projects, state.activeProjectId);
        return {
          projects,
          ...(isActive
            ? {
                messages: inbound.messages,
                memory: inbound.memory,
                initialWelcomeShown: inbound.messages.some((msg) => msg.sender === "user"),
              }
            : {}),
        };
      });
    } catch (error) {
      console.debug("Toron load skipped", error);
    }
  },
}));

export const personaToneMap: Record<PersonaMode, string> = {
  fitness: "As your fitness coach, I'm fired up to help you stay disciplined and strong. ",
  anime: "Channeling energetic otaku vibes—let's power up this quest! ",
  journal: "In a reflective tone, here's a gentle thought. ",
  engineering: "Analyzing with precise, technical focus. ",
  default: "",
};
