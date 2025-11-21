import { useSyncExternalStore } from "react";
import { Project, SanitizedMessage, Thread } from "@/types/projects";

const MAX_CONTENT_LENGTH = 40000;
const TOKEN_LIMIT = 10000;

const listeners = new Set<() => void>();

const state: {
  projects: Project[];
  activeProjectId?: string;
  activeThreadId?: string;
  loading: boolean;
} = {
  projects: [],
  activeProjectId: undefined,
  activeThreadId: undefined,
  loading: false,
};

const emit = () => listeners.forEach((listener) => listener());

const updateState = (patch: Partial<typeof state>) => {
  Object.assign(state, patch);
  emit();
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const sanitizeContent = (value: string) => {
  const normalized = normalizeWhitespace(value || "");
  const withoutEmails = normalized.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    "[redacted]",
  );
  const withoutPhones = withoutEmails.replace(
    /\+?\d[\d\s().-]{8,}\d/g,
    "[redacted]",
  );
  const withoutSsn = withoutPhones.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[redacted]");
  const withoutCards = withoutSsn.replace(/\b(?:\d[ -]*?){13,16}\b/g, "[redacted]");
  const withoutAddress = withoutCards.replace(
    /\b\d{1,5}\s+\w+(?:\s+\w+){1,3}\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi,
    "[redacted]",
  );
  const safeLength = withoutAddress.slice(0, MAX_CONTENT_LENGTH);
  const tokens = safeLength.split(/\s+/).length;
  if (tokens > TOKEN_LIMIT) {
    return safeLength.split(/\s+/).slice(0, TOKEN_LIMIT).join(" ");
  }
  return safeLength;
};

const sanitizeMessage = (message: Partial<SanitizedMessage>): SanitizedMessage => ({
  role: message.role === "assistant" ? "assistant" : "user",
  content: sanitizeContent(message.content ?? ""),
  timestamp: message.timestamp
    ? new Date(message.timestamp).toISOString()
    : new Date().toISOString(),
});

const sanitizeThread = (thread: Partial<Thread>): Thread => ({
  id: String(thread.id ?? crypto.randomUUID()),
  title: normalizeWhitespace(thread.title ?? "Untitled thread") || "Untitled thread",
  messages: Array.isArray(thread.messages)
    ? thread.messages.map((msg) => sanitizeMessage(msg))
    : [],
});

const sanitizeProject = (project: Partial<Project>): Project => ({
  id: String(project.id ?? crypto.randomUUID()),
  name: normalizeWhitespace(project.name ?? "Untitled project") || "Untitled project",
  createdAt: project.createdAt
    ? new Date(project.createdAt).toISOString()
    : new Date().toISOString(),
  threads: Array.isArray(project.threads)
    ? project.threads.map((thread) => sanitizeThread(thread))
    : [],
});

const normalizeProjectsResponse = (payload: any): Project[] => {
  const list = Array.isArray(payload) ? payload : payload?.projects;
  if (!Array.isArray(list)) return [];
  return list.map((item) => sanitizeProject(item));
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
};

const upsertProject = (project: Project) => {
  const existingIndex = state.projects.findIndex((p) => p.id === project.id);
  if (existingIndex >= 0) {
    state.projects.splice(existingIndex, 1, project);
  } else {
    state.projects.push(project);
  }
};

const removeProjectFromState = (projectId: string) => {
  const next = state.projects.filter((p) => p.id !== projectId);
  updateState({
    projects: next,
    activeProjectId:
      state.activeProjectId === projectId ? next[0]?.id : state.activeProjectId,
    activeThreadId:
      state.activeProjectId === projectId ? next[0]?.threads?.[0]?.id : state.activeThreadId,
  });
};

const setActive = (projectId?: string, threadId?: string) => {
  updateState({ activeProjectId: projectId, activeThreadId: threadId });
};

export const projectsStore = {
  use() {
    const snapshot = () => state;
    const subscribe = (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };
    const data = useSyncExternalStore(subscribe, snapshot, snapshot);
    return {
      ...data,
      setActiveProjectThread: setActive,
      getProjects: () => projectsStore.getProjects(),
      createProject: (name: string) => projectsStore.createProject(name),
      renameProject: (id: string, name: string) => projectsStore.renameProject(id, name),
      deleteProject: (id: string) => projectsStore.deleteProject(id),
      createThread: (projectId: string, title: string) =>
        projectsStore.createThread(projectId, title),
      appendMessage: (
        projectId: string,
        threadId: string,
        sanitizedMessage: SanitizedMessage,
      ) => projectsStore.appendMessage(projectId, threadId, sanitizedMessage),
      getThreadContext: (projectId: string, threadId: string) =>
        projectsStore.getThreadContext(projectId, threadId),
    };
  },

  async getProjects(): Promise<Project[]> {
    updateState({ loading: true });
    try {
      const payload = await request<any>("/api/v1/projects");
      const projects = normalizeProjectsResponse(payload);
      updateState({
        projects,
        activeProjectId: state.activeProjectId ?? projects[0]?.id,
        activeThreadId: state.activeThreadId ?? projects[0]?.threads?.[0]?.id,
      });
      return projects;
    } finally {
      updateState({ loading: false });
    }
  },

  async createProject(name: string): Promise<Project> {
    const sanitizedName = sanitizeContent(name || "Untitled project");
    const project = await request<Project>("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify({ name: sanitizedName }),
    });
    const sanitized = sanitizeProject(project);
    upsertProject(sanitized);
    updateState({
      projects: [...state.projects],
      activeProjectId: sanitized.id,
      activeThreadId: sanitized.threads[0]?.id,
    });
    return sanitized;
  },

  async renameProject(id: string, name: string): Promise<Project | null> {
    const sanitizedName = sanitizeContent(name || "Untitled project");
    const project = await request<Project>(`/api/v1/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name: sanitizedName }),
    });
    if (!project) return null;
    const sanitized = sanitizeProject(project);
    upsertProject(sanitized);
    updateState({ projects: [...state.projects] });
    return sanitized;
  },

  async deleteProject(id: string): Promise<void> {
    await request(`/api/v1/projects/${id}`, { method: "DELETE" });
    removeProjectFromState(id);
  },

  async createThread(projectId: string, title: string): Promise<Thread> {
    const sanitizedTitle = sanitizeContent(title || "New thread");
    const thread = await request<Thread>(`/api/v1/projects/${projectId}/threads`, {
      method: "POST",
      body: JSON.stringify({ title: sanitizedTitle }),
    });
    const sanitized = sanitizeThread(thread);
    const project = state.projects.find((p) => p.id === projectId);
    if (project) {
      project.threads.push(sanitized);
      updateState({
        projects: [...state.projects],
        activeProjectId: projectId,
        activeThreadId: sanitized.id,
      });
    }
    return sanitized;
  },

  async appendMessage(
    projectId: string,
    threadId: string,
    sanitizedMessage: SanitizedMessage,
  ): Promise<SanitizedMessage> {
    const payload = sanitizeMessage(sanitizedMessage);
    const saved = await request<SanitizedMessage>(
      `/api/v1/projects/${projectId}/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
    const project = state.projects.find((p) => p.id === projectId);
    const thread = project?.threads.find((t) => t.id === threadId);
    if (thread) {
      thread.messages.push(sanitizeMessage(saved));
      updateState({ projects: [...state.projects] });
    }
    return sanitizeMessage(saved);
  },

  async getThreadContext(projectId: string, threadId: string): Promise<Thread | null> {
    const data = await request<{ context: SanitizedMessage[] }>(
      `/api/v1/projects/${projectId}/threads/${threadId}/context`,
    );
    const messages = Array.isArray(data?.context)
      ? data.context.map((msg) => sanitizeMessage(msg))
      : [];
    const project = state.projects.find((p) => p.id === projectId);
    const thread = project?.threads.find((t) => t.id === threadId);
    const normalized: Thread = {
      id: thread?.id ?? threadId,
      title: thread?.title ?? "Context",
      messages,
    };
    if (project && thread) {
      thread.messages = messages;
      updateState({ projects: [...state.projects] });
    }
    return normalized;
  },
};

export const sanitizeProjectMessage = sanitizeMessage;
