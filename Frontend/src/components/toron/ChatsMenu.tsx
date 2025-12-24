/**
 * ChatsMenu Component
 * Displays time-grouped chat conversations with search
 * Design: Ultra-smooth scroll, custom scrollbar, precise spacing
 */

import { useRef, useEffect } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { cn, text, bg, border } from '../../utils/theme';
import { useChats } from '../../hooks/useChats';
import ChatItem from './ChatItem';
import EmptyState from './EmptyState';

interface ChatsMenuProps {
  onNewChat?: () => void;
}

export default function ChatsMenu({ onNewChat }: ChatsMenuProps) {
  const {
    chats,
    groupedChats,
    searchQuery,
    setSearchQuery,
    activeChat,
    setActiveChat,
    deleteChat,
    renameChat,
    pinChat,
  } = useChats();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Show search only if more than 5 chats
  const showSearch = chats.length > 5;

  // Handle chat rename
  const handleRename = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;

    const newTitle = prompt('Enter new title:', chat.title);
    if (newTitle && newTitle.trim()) {
      renameChat(chatId, newTitle.trim());
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
              placeholder="Search chats..."
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
        {chats.length === 0 && (
          <EmptyState
            icon={MessageSquare}
            title="No chats found"
            description={searchQuery ? 'Try a different search term' : 'Start a new conversation'}
            actionLabel={!searchQuery ? 'New Chat' : undefined}
            onAction={onNewChat}
          />
        )}

        {/* Chat groups */}
        {groupedChats.map((group, groupIndex) => (
          <div key={group.label} className={groupIndex > 0 ? 'mt-2' : ''}>
            {/* Section label */}
            <div
              className={cn(
                'px-2 py-2 text-[11px] font-semibold uppercase tracking-wide',
                text.tertiary
              )}
              style={{ letterSpacing: '0.02em' }}
            >
              {group.label}
            </div>

            {/* Chat items */}
            <div className="space-y-0.5">
              {group.chats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChat}
                  onClick={() => setActiveChat(chat.id)}
                  onDelete={() => deleteChat(chat.id)}
                  onRename={() => handleRename(chat.id)}
                  onPin={() => pinChat(chat.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        /* Webkit scrollbar */
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
