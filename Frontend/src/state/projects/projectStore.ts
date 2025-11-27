import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProjectItemType = "note" | "toron-output" | "task";

export interface ProjectItem {
  id: string;
  type: ProjectItemType;
  content: string;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  items: ProjectItem[];
}

interface ProjectStore {
  projects: Project[];
  createProject: (name: string) => string;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  addItem: (projectId: string, item: ProjectItem) => void;
  deleteItem: (projectId: string, itemId: string) => void;
  updateItem: (projectId: string, itemId: string, content: string) => void;
}

const withUpdatedProject = (projects: Project[], projectId: string, updater: (project: Project) => Project) =>
  projects.map((project) => (project.id === projectId ? updater(project) : project));

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],

      createProject: (name) => {
        const id = nanoid();
        const now = Date.now();
        set((state) => ({
          projects: [
            ...state.projects,
            {
              id,
              name: name.trim() || "Untitled Project",
              createdAt: now,
              updatedAt: now,
              items: [],
            },
          ],
        }));
        return id;
      },

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),

      renameProject: (id, name) =>
        set((state) => ({
          projects: withUpdatedProject(state.projects, id, (project) => ({
            ...project,
            name: name.trim() || project.name,
            updatedAt: Date.now(),
          })),
        })),

      addItem: (projectId, item) =>
        set((state) => ({
          projects: withUpdatedProject(state.projects, projectId, (project) => ({
            ...project,
            items: [...project.items, item],
            updatedAt: Date.now(),
          })),
        })),

      deleteItem: (projectId, itemId) =>
        set((state) => ({
          projects: withUpdatedProject(state.projects, projectId, (project) => ({
            ...project,
            items: project.items.filter((i) => i.id !== itemId),
            updatedAt: Date.now(),
          })),
        })),

      updateItem: (projectId, itemId, content) =>
        set((state) => ({
          projects: withUpdatedProject(state.projects, projectId, (project) => ({
            ...project,
            items: project.items.map((item) =>
              item.id === itemId ? { ...item, content, createdAt: item.createdAt } : item,
            ),
            updatedAt: Date.now(),
          })),
        })),
    }),
    { name: "project-store" },
  ),
);
