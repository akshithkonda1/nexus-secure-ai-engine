import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { projectStorage } from "./projectStorage";
import {
  Project,
  ProjectContextState,
  ProjectTask,
  ProjectConnectors,
} from "./types";
import { loadProjectContext, resetEphemeralContext, saveProjectContext } from "@/components/toron/context/contextMediator";

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();
const REDACTION = "[sanitized]";
const safeText = (value: string) => {
  const trimmed = normalizeWhitespace(value || "");
  if (!trimmed) return "";
  return trimmed
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTION)
    .replace(/\+?\d[\d\s().-]{8,}\d/g, REDACTION)
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, REDACTION)
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, REDACTION)
    .slice(0, 280);
};

const sanitizeNumber = (value: number | undefined, fallback = 0) => {
  if (Number.isNaN(Number(value))) return fallback;
  const clamped = Math.max(0, Math.min(1, Number(value)));
  return Number.isFinite(clamped) ? clamped : fallback;
};

const sanitizeTask = (task: Partial<ProjectTask>, index: number): ProjectTask => ({
  id: task.id ?? crypto.randomUUID(),
  text: safeText(task.text ?? `Task ${index + 1}`),
  done: Boolean(task.done),
});

const defaultContextState = (): ProjectContextState => ({
  persona: "toron-ops", // sanitized persona descriptor
  reasoningHints: [],
  continuityScore: 0.42,
  difficultyScore: 0.3,
  topicTags: [],
});

const sanitizeContextState = (
  state: Partial<ProjectContextState> | undefined,
): ProjectContextState => ({
  persona: safeText(state?.persona ?? defaultContextState().persona),
  reasoningHints: Array.isArray(state?.reasoningHints)
    ? state!.reasoningHints.map((hint) => safeText(hint)).filter(Boolean)
    : [],
  continuityScore: sanitizeNumber(state?.continuityScore, defaultContextState().continuityScore),
  difficultyScore: sanitizeNumber(state?.difficultyScore, defaultContextState().difficultyScore),
  topicTags: Array.isArray(state?.topicTags)
    ? state!.topicTags.map((tag) => safeText(tag)).filter(Boolean)
    : [],
});

const sanitizeConnectors = (value: Partial<ProjectConnectors> | undefined): ProjectConnectors => ({
  github: Boolean(value?.github),
  googleDrive: Boolean(value?.googleDrive),
  quizlet: Boolean(value?.quizlet),
});

const sanitizeProject = (incoming: Partial<Project>): Project => {
  const now = Date.now();
  const existingVersion = typeof incoming.version === "number" ? incoming.version : 0;
  return {
    id: incoming.id ?? crypto.randomUUID(),
    name: safeText(incoming.name ?? "Untitled project"),
    createdAt: incoming.createdAt ?? now,
    updatedAt: now,
    summary: safeText(incoming.summary ?? ""),
    semanticGraph: Array.isArray(incoming.semanticGraph)
      ? incoming.semanticGraph.map((row) => (Array.isArray(row) ? row.map((n) => Number(n) || 0) : []))
      : [],
    taskList: Array.isArray(incoming.taskList)
      ? incoming.taskList.map((task, index) => sanitizeTask(task, index))
      : [],
    connectorsEnabled: sanitizeConnectors(incoming.connectorsEnabled),
    contextState: sanitizeContextState(incoming.contextState),
    version: existingVersion,
  };
};

type ProjectContextValue = {
  projects: Project[];
  activeProject?: Project;
  loading: boolean;
  createProject: (name: string) => Promise<Project>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<Project | undefined>;
  deleteProject: (id: string) => Promise<void>;
  selectProject: (id: string) => Promise<void>;
  persistActiveContext: () => Promise<void>;
};

export const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId),
    [projects, activeProjectId],
  );

  useEffect(() => {
    let mounted = true;
    projectStorage
      .load()
      .then((stored) => {
        if (!mounted) return;
        const sanitized = stored.map((item) => sanitizeProject(item));
        setProjects(sanitized);
        if (sanitized[0]) {
          setActiveProjectId(sanitized[0].id);
          loadProjectContext(sanitized[0].id, sanitized[0].contextState);
        }
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const persistProjects = useCallback(
    async (nextProjects: Project[]) => {
      const sanitized = nextProjects.map((project) => sanitizeProject(project));
      setProjects(sanitized);
      await projectStorage.persist(sanitized);
    },
    [],
  );

  const selectProject = useCallback(
    async (id: string) => {
      const target = projects.find((project) => project.id === id);
      setActiveProjectId(id);
      if (target) {
        loadProjectContext(id, target.contextState);
      } else {
        resetEphemeralContext();
      }
    },
    [projects],
  );

  const createProject = useCallback(
    async (name: string): Promise<Project> => {
      const base: Project = sanitizeProject({
        id: crypto.randomUUID(),
        name,
        summary: "",
        semanticGraph: [],
        taskList: [],
        connectorsEnabled: {},
        contextState: defaultContextState(),
        version: 1,
      });
      const next = [base, ...projects];
      await persistProjects(next);
      setActiveProjectId(base.id);
      loadProjectContext(base.id, base.contextState);
      return base;
    },
    [persistProjects, projects],
  );

  const updateProject = useCallback(
    async (id: string, patch: Partial<Project>) => {
      const next = projects.map((project) => {
        if (project.id !== id) return project;
        return sanitizeProject({
          ...project,
          ...patch,
          version: (project.version ?? 0) + 1,
          updatedAt: Date.now(),
        });
      });
      await persistProjects(next);
      const updated = next.find((project) => project.id === id);
      if (updated && activeProjectId === id) {
        loadProjectContext(id, updated.contextState);
      }
      return updated;
    },
    [activeProjectId, persistProjects, projects],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      const next = projects.filter((project) => project.id !== id);
      await persistProjects(next);
      if (activeProjectId === id) {
        const fallback = next[0];
        setActiveProjectId(fallback?.id);
        if (fallback) {
          loadProjectContext(fallback.id, fallback.contextState);
        } else {
          resetEphemeralContext();
        }
      }
    },
    [activeProjectId, persistProjects, projects],
  );

  const persistActiveContext = useCallback(async () => {
    if (!activeProjectId) return;
    const snapshot = await saveProjectContext(activeProjectId);
    await updateProject(activeProjectId, { contextState: snapshot });
  }, [activeProjectId, updateProject]);

  const value = useMemo(
    () => ({
      projects,
      activeProject,
      loading,
      createProject,
      updateProject,
      deleteProject,
      selectProject,
      persistActiveContext,
    }),
    [
      projects,
      activeProject,
      loading,
      createProject,
      updateProject,
      deleteProject,
      selectProject,
      persistActiveContext,
    ],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
