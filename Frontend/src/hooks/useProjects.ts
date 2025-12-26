/**
 * useProjects Hook
 * Manages project workspaces connected to the Toron store
 * Design: Searchable, with CRUD operations
 */

import { useCallback, useMemo } from 'react';
import { useToronStore, type Project } from '../stores/useToronStore';

interface UseProjectsReturn {
  projects: Project[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeProject: string | null;
  setActiveProject: (projectId: string | null) => void;
  createProject: (name: string, description?: string, color?: string) => string;
  deleteProject: (projectId: string) => void;
  renameProject: (projectId: string, newName: string) => void;
  archiveProject: (projectId: string) => void;
  unarchiveProject: (projectId: string) => void;
  addChatToProject: (projectId: string, chatId: string) => void;
  removeChatFromProject: (projectId: string, chatId: string) => void;
}

export function useProjects(): UseProjectsReturn {
  // Get state from store
  const projects = useToronStore(state => state.projects);
  const searchQuery = useToronStore(state => state.searchQuery);
  const activeProject = useToronStore(state => state.activeProject);

  // Get actions from store
  const setSearchQuery = useToronStore(state => state.setSearchQuery);
  const setActiveProject = useToronStore(state => state.setActiveProject);
  const createProject = useToronStore(state => state.createProject);
  const deleteProjectAction = useToronStore(state => state.deleteProject);
  const updateProject = useToronStore(state => state.updateProject);
  const archiveProjectAction = useToronStore(state => state.archiveProject);
  const unarchiveProjectAction = useToronStore(state => state.unarchiveProject);
  const addChatToProject = useToronStore(state => state.addChatToProject);
  const removeChatFromProject = useToronStore(state => state.removeChatFromProject);

  // Filter projects based on search (exclude archived)
  const filteredProjects = useMemo(() => {
    const activeProjects = projects.filter(p => !p.archived);

    if (!searchQuery.trim()) return activeProjects;

    const query = searchQuery.toLowerCase();
    return activeProjects.filter(project =>
      project.name.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // Rename project handler
  const renameProject = useCallback((projectId: string, newName: string) => {
    updateProject(projectId, { name: newName });
  }, [updateProject]);

  // Delete project handler
  const deleteProject = useCallback((projectId: string) => {
    deleteProjectAction(projectId);
  }, [deleteProjectAction]);

  // Archive project handler
  const archiveProject = useCallback((projectId: string) => {
    archiveProjectAction(projectId);
  }, [archiveProjectAction]);

  // Unarchive project handler
  const unarchiveProject = useCallback((projectId: string) => {
    unarchiveProjectAction(projectId);
  }, [unarchiveProjectAction]);

  return {
    projects: filteredProjects,
    searchQuery,
    setSearchQuery,
    activeProject,
    setActiveProject,
    createProject,
    deleteProject,
    renameProject,
    archiveProject,
    unarchiveProject,
    addChatToProject,
    removeChatFromProject,
  };
}

export default useProjects;
