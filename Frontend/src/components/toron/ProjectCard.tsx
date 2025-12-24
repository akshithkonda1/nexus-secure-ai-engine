/**
 * ProjectCard Component
 * Project workspace card with elevated interactions
 * Design: Card-based, 8px radius, lift on hover, accent border when active
 */

import { useState } from 'react';
import { Folder, MoreVertical, Trash2, Edit3, Archive } from 'lucide-react';
import { cn, text, border } from '../../utils/theme';
import { Project, ContextMenuItem } from '../../types/toron';
import ContextMenu from './ContextMenu';

interface ProjectCardProps {
  project: Project;
  isActive?: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onArchive?: () => void;
}

export default function ProjectCard({
  project,
  isActive = false,
  onClick,
  onDelete,
  onRename,
  onArchive,
}: ProjectCardProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<HTMLElement | null>(null);

  const handleContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setContextMenuAnchor(e.currentTarget);
    setShowContextMenu(true);
  };

  // Format time ago
  const getTimeAgo = () => {
    const now = new Date();
    const diff = now.getTime() - project.updatedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return project.updatedAt.toLocaleDateString();
  };

  // Context menu items
  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'rename',
      label: 'Rename',
      icon: Edit3,
      onClick: () => onRename?.(),
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      onClick: () => onArchive?.(),
    },
    {
      id: 'separator-1',
      label: '',
      icon: () => null,
      onClick: () => {},
      separator: true,
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDelete?.(),
      danger: true,
    },
  ];

  return (
    <>
      <button
        onClick={onClick}
        className={cn(
          'group relative flex w-full flex-col items-start gap-0 rounded-lg border p-3 text-left transition-all cursor-pointer min-h-[80px]',
          isActive
            ? cn(
                'border-[var(--accent-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]',
                'bg-[var(--accent-subtle)]'
              )
            : cn(
                border.subtle,
                'bg-[var(--bg-secondary)]',
                'hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:-translate-y-px'
              )
        )}
        style={{
          transitionDuration: '150ms',
          transitionTimingFunction: 'ease',
        }}
      >
        {/* Header row */}
        <div className="flex w-full items-start gap-2">
          {/* Icon */}
          <div
            className={cn(
              'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded',
              isActive
                ? 'bg-[var(--accent-primary)] text-white'
                : 'bg-[var(--bg-active)] text-[var(--text-secondary)]'
            )}
          >
            <Folder className="h-4 w-4" />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'text-sm font-semibold leading-[1.2] line-clamp-1',
                text.primary
              )}
              style={{ letterSpacing: '-0.01em' }}
            >
              {project.name}
            </div>
          </div>

          {/* Context menu button */}
          <button
            onClick={handleContextMenu}
            className={cn(
              'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded transition-all',
              'opacity-0 group-hover:opacity-100',
              'hover:bg-[var(--bg-hover)]'
            )}
            style={{
              transitionDuration: '150ms',
              transitionTimingFunction: 'ease',
            }}
          >
            <MoreVertical className={cn('h-3.5 w-3.5', text.secondary)} />
          </button>
        </div>

        {/* Description */}
        {project.description && (
          <div
            className={cn(
              'mt-1 text-xs leading-[1.4] line-clamp-2',
              text.secondary
            )}
          >
            {project.description}
          </div>
        )}

        {/* Footer row */}
        <div className={cn('mt-2 flex w-full items-center gap-2 text-[11px]', text.tertiary)}>
          <span>{project.chatIds.length} {project.chatIds.length === 1 ? 'chat' : 'chats'}</span>
          <span>•</span>
          <span>Updated {getTimeAgo()}</span>
        </div>
      </button>

      {/* Context menu */}
      <ContextMenu
        items={contextMenuItems}
        isOpen={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        anchorEl={contextMenuAnchor}
      />
    </>
  );
}
