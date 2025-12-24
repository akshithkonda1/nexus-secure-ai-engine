/**
 * ProjectsMenu Component
 * Displays project workspaces with search
 * Design: Card-based layout, smooth scroll, custom scrollbar
 */

import { useRef } from 'react';
import { Search, Folder } from 'lucide-react';
import { cn, text, bg, border } from '../../utils/theme';
import { useProjects } from '../../hooks/useProjects';
import ProjectCard from './ProjectCard';
import EmptyState from './EmptyState';

interface ProjectsMenuProps {
  onNewProject?: () => void;
}

export default function ProjectsMenu({ onNewProject }: ProjectsMenuProps) {
  const {
    projects,
    searchQuery,
    setSearchQuery,
    activeProject,
    setActiveProject,
    deleteProject,
    renameProject,
    archiveProject,
  } = useProjects();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Show search only if more than 5 projects
  const showSearch = projects.length > 5;

  // Handle project rename
  const handleRename = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const newName = prompt('Enter new project name:', project.name);
    if (newName && newName.trim()) {
      renameProject(projectId, newName.trim());
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Search input */}
      {showSearch && (
        <div className="flex-shrink-0 px-3 pb-4 pt-3">
          <div className="relative">
            <Search
              className={cn('absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2', text.tertiary)}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className={cn(
                'h-8 w-full rounded-md border px-2 pl-8 text-[13px] outline-none transition-all',
                border.subtle,
                bg.elevated,
                text.primary,
                'placeholder:text-[var(--text-tertiary)]',
                'focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/10'
              )}
              style={{
                transitionDuration: '150ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 pb-3"
        style={{
          overscrollBehavior: 'contain',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Empty state */}
        {projects.length === 0 && (
          <EmptyState
            icon={Folder}
            title="No projects found"
            description={searchQuery ? 'Try a different search term' : 'Create a new project workspace'}
            actionLabel={!searchQuery ? 'New Project' : undefined}
            onAction={onNewProject}
          />
        )}

        {/* Project cards */}
        <div className="space-y-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isActive={project.id === activeProject}
              onClick={() => setActiveProject(project.id)}
              onDelete={() => deleteProject(project.id)}
              onRename={() => handleRename(project.id)}
              onArchive={() => archiveProject(project.id)}
            />
          ))}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        /* Webkit scrollbar for projects menu */
        .flex-1.overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .flex-1.overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
          transition: background 200ms ease;
        }

        .flex-1.overflow-y-auto:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
        }

        .flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.25);
        }

        /* Dark mode scrollbar */
        @media (prefers-color-scheme: dark) {
          .flex-1.overflow-y-auto:hover::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
          }

          .flex-1.overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
          }
        }
      `}</style>
    </div>
  );
}
