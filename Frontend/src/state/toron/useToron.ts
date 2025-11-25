import { useCallback, useMemo, useState } from "react";

export type ToronTab = "chats" | "projects" | "workspace";

export interface ToronChat {
  id: string;
  title: string;
  updatedAt: string;
  tags?: string[];
}

export interface ToronProject {
  id: string;
  projectName: string;
  lastModified: string;
  modelConfig: string;
}

const mockChats: ToronChat[] = [
  { id: "c1", title: "Safety Alignment Sprint", updatedAt: "2m ago", tags: ["safety"] },
  { id: "c2", title: "Toolformer Ops", updatedAt: "12m ago", tags: ["tools", "ops"] },
  { id: "c3", title: "Governance Briefing", updatedAt: "1h ago", tags: ["gov"] },
];

const mockProjects: ToronProject[] = [
  { id: "p1", projectName: "Multimodal Planner", lastModified: "5m ago", modelConfig: "gpt-ops / stub" },
  { id: "p2", projectName: "Guardrail Watchtower", lastModified: "14m ago", modelConfig: "red-team / stub" },
  { id: "p3", projectName: "Realtime Evaluator", lastModified: "29m ago", modelConfig: "eval-kit / stub" },
];

export function useToron() {
  const [activeTab, setActiveTab] = useState<ToronTab>("chats");
  const [chats, setChats] = useState<ToronChat[]>(mockChats);
  const [projects, setProjects] = useState<ToronProject[]>(mockProjects);

  const addChat = useCallback(() => {
    const next: ToronChat = {
      id: `c-${Date.now()}`,
      title: "New Toron Chat",
      updatedAt: "just now",
      tags: ["new"],
    };
    setChats((current) => [next, ...current]);
  }, []);

  const removeChat = useCallback((id: string) => setChats((current) => current.filter((chat) => chat.id !== id)), []);

  const addProject = useCallback(() => {
    const next: ToronProject = {
      id: `p-${Date.now()}`,
      projectName: "Untitled Project",
      lastModified: "just now",
      modelConfig: "placeholder",
    };
    setProjects((current) => [next, ...current]);
  }, []);

  const removeProject = useCallback(
    (id: string) => setProjects((current) => current.filter((project) => project.id !== id)),
    [],
  );

  return useMemo(
    () => ({
      tab: activeTab,
      setTab: setActiveTab,
      chats,
      projects,
      addChat,
      removeChat,
      addProject,
      removeProject,
    }),
    [activeTab, chats, projects, addChat, removeChat, addProject, removeProject],
  );
}

export default useToron;
