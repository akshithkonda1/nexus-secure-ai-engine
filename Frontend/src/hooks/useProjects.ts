/**
 * useProjects Hook
 * Manages project workspaces with realistic mock data
 * Design: Searchable, with CRUD operations
 */

import { useState, useMemo } from 'react';
import { Project } from '../types/toron';

// Realistic mock data for projects
const generateMockProjects = (): Project[] => {
  const now = new Date();

  return [
    {
      id: 'project-1',
      name: 'Customer Portal Redesign',
      description: 'Complete overhaul of the customer-facing portal with modern UI/UX patterns and improved performance.',
      chatIds: ['chat-1', 'chat-3', 'chat-7'],
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      color: '#3b82f6',
      isActive: true,
    },
    {
      id: 'project-2',
      name: 'API Infrastructure Upgrade',
      description: 'Migrate to microservices architecture with improved scalability and fault tolerance.',
      chatIds: ['chat-2', 'chat-4', 'chat-6'],
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      color: '#8b5cf6',
    },
    {
      id: 'project-3',
      name: 'Marketing Automation',
      description: 'Build end-to-end marketing automation platform with campaign management and analytics.',
      chatIds: ['chat-5', 'chat-13'],
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      color: '#ef4444',
    },
    {
      id: 'project-4',
      name: 'Mobile App Development',
      description: 'Native iOS and Android apps with offline-first architecture and push notifications.',
      chatIds: ['chat-9'],
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      color: '#10b981',
    },
    {
      id: 'project-5',
      name: 'Analytics & Reporting',
      description: 'Real-time analytics dashboard with custom reporting and data visualization.',
      chatIds: ['chat-11', 'chat-14'],
      createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000),
      color: '#f59e0b',
    },
    {
      id: 'project-6',
      name: 'Security & Compliance',
      description: 'Implement SOC2 compliance requirements and enhance security infrastructure.',
      chatIds: ['chat-6', 'chat-12'],
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      color: '#ec4899',
    },
    {
      id: 'project-7',
      name: 'Team Collaboration Tools',
      description: 'Internal tools for team communication, knowledge sharing, and project management.',
      chatIds: ['chat-8'],
      createdAt: new Date(now.getTime() - 105 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      color: '#6366f1',
    },
  ];
};

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(generateMockProjects());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProject, setActiveProject] = useState<string | null>('project-1');

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;

    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // CRUD operations
  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
    if (activeProject === projectId) {
      setActiveProject(null);
    }
  };

  const renameProject = (projectId: string, newName: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, name: newName } : project
      )
    );
  };

  const archiveProject = (projectId: string) => {
    // For now, just remove it - could add an "archived" flag later
    deleteProject(projectId);
  };

  const createProject = (name: string, description?: string) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      description,
      chatIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProject(newProject.id);
    return newProject;
  };

  return {
    projects: filteredProjects,
    searchQuery,
    setSearchQuery,
    activeProject,
    setActiveProject,
    deleteProject,
    renameProject,
    archiveProject,
    createProject,
  };
}
