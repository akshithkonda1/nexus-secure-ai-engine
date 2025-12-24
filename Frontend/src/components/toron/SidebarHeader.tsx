/**
 * SidebarHeader Component
 * Toggle buttons for Chats/Projects + New Item button
 * Design: 56px height, smooth transitions, perfect alignment
 */

import { Plus } from 'lucide-react';
import { cn, text } from '../../utils/theme';
import { MenuType } from '../../types/toron';

interface SidebarHeaderProps {
  activeMenu: MenuType;
  onMenuChange: (menu: MenuType) => void;
  onNewItem: () => void;
  isScrolled?: boolean;
}

export default function SidebarHeader({
  activeMenu,
  onMenuChange,
  onNewItem,
  isScrolled = false,
}: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'flex h-14 flex-shrink-0 items-center justify-between gap-3 px-4 transition-all',
        isScrolled && 'border-b border-[var(--border-subtle)] shadow-sm'
      )}
      style={{
        transitionDuration: '200ms',
        transitionTimingFunction: 'ease',
      }}
    >
      {/* Toggle buttons */}
      <div className="flex flex-1 gap-1">
        {/* Chats button */}
        <button
          onClick={() => onMenuChange('chats')}
          aria-pressed={activeMenu === 'chats'}
          className={cn(
            'flex-1 rounded-md px-3 py-2 text-[13px] font-medium transition-all',
            activeMenu === 'chats'
              ? cn(
                  'bg-[var(--bg-active)] shadow-sm',
                  text.primary,
                  'font-semibold'
                )
              : cn(
                  'bg-transparent',
                  text.secondary,
                  'hover:bg-[var(--bg-hover)]'
                )
          )}
          style={{
            transitionDuration: '150ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          Chats
        </button>

        {/* Projects button */}
        <button
          onClick={() => onMenuChange('projects')}
          aria-pressed={activeMenu === 'projects'}
          className={cn(
            'flex-1 rounded-md px-3 py-2 text-[13px] font-medium transition-all',
            activeMenu === 'projects'
              ? cn(
                  'bg-[var(--bg-active)] shadow-sm',
                  text.primary,
                  'font-semibold'
                )
              : cn(
                  'bg-transparent',
                  text.secondary,
                  'hover:bg-[var(--bg-hover)]'
                )
          )}
          style={{
            transitionDuration: '150ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          Projects
        </button>
      </div>

      {/* New item button */}
      <button
        onClick={onNewItem}
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-white transition-all',
          'bg-[var(--accent-primary)]',
          'hover:bg-[var(--accent-hover)]',
          'active:scale-95'
        )}
        style={{
          transitionDuration: '100ms',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        title={activeMenu === 'chats' ? 'New Chat' : 'New Project'}
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
