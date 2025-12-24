/**
 * ChatItem Component
 * Individual chat list item with ultra-polished interactions
 * Design: Min 44px touch target, subtle hover, sharp active state
 */

import { useState } from 'react';
import { MessageSquare, MoreVertical, Pin, Trash2, Edit3 } from 'lucide-react';
import { cn, text } from '../../utils/theme';
import { Chat, ContextMenuItem } from '../../types/toron';
import ContextMenu from './ContextMenu';

interface ChatItemProps {
  chat: Chat;
  isActive?: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onPin?: () => void;
}

export default function ChatItem({
  chat,
  isActive = false,
  onClick,
  onDelete,
  onRename,
  onPin,
}: ChatItemProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuAnchor, setContextMenuAnchor] = useState<HTMLElement | null>(null);

  const handleContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setContextMenuAnchor(e.currentTarget);
    setShowContextMenu(true);
  };

  // Generate icon from title (first letter or emoji)
  const getIcon = () => {
    const firstChar = chat.title.charAt(0);
    return firstChar.match(/[\p{Emoji}]/u) ? firstChar : firstChar.toUpperCase();
  };

  // Format time ago
  const getTimeAgo = () => {
    const now = new Date();
    const diff = now.getTime() - chat.updatedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return chat.updatedAt.toLocaleDateString();
  };

  // Context menu items
  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'pin',
      label: chat.isPinned ? 'Unpin' : 'Pin to top',
      icon: Pin,
      onClick: () => onPin?.(),
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: Edit3,
      onClick: () => onRename?.(),
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
          'group relative flex w-full min-h-[44px] items-start gap-2 rounded-md px-2 py-2 text-left transition-all cursor-pointer',
          isActive
            ? 'bg-[var(--bg-active)] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
            : 'bg-transparent hover:bg-[var(--bg-hover)]'
        )}
        style={{
          transitionDuration: '150ms',
          transitionTimingFunction: 'ease',
        }}
      >
        {/* Icon */}
        <div
          className={cn(
            'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium',
            isActive
              ? 'bg-[var(--accent-primary)] text-white'
              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
          )}
        >
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div
            className={cn(
              'text-[13px] font-medium leading-[1.4] line-clamp-1',
              text.primary
            )}
            style={{ letterSpacing: '-0.01em' }}
          >
            {chat.title}
          </div>

          {/* Preview text */}
          {chat.preview && (
            <div
              className={cn(
                'mt-0.5 text-xs leading-[1.4] line-clamp-1',
                text.tertiary
              )}
            >
              {chat.preview}
            </div>
          )}

          {/* Metadata row */}
          <div className={cn('mt-1 flex items-center gap-2 text-[11px]', text.tertiary)}>
            <span>{chat.messageCount} messages</span>
            <span>•</span>
            <span>{getTimeAgo()}</span>
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

        {/* Pin indicator */}
        {chat.isPinned && (
          <Pin
            className={cn('absolute right-2 top-2 h-3 w-3', text.tertiary)}
            fill="currentColor"
          />
        )}
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
