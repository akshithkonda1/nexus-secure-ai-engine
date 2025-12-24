import { useState, useMemo } from 'react';
import { Search, Pin, MoreVertical } from 'lucide-react';
import { cn } from '../../utils/theme';

interface Chat {
  id: string;
  title: string;
  preview: string;
  messages: number;
  timeAgo: string;
  isPinned?: boolean;
  icon?: string;
  updatedAt: Date;
}

// Mock data - replace with real data later
const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    title: 'API Rate Limiting Implementation',
    preview: 'We should consider using Redis fo...',
    messages: 17,
    timeAgo: '5h ago',
    isPinned: true,
    icon: 'A',
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Security Audit Preparation',
    preview: "Let's review the authentication flo...",
    messages: 52,
    timeAgo: '4d ago',
    isPinned: true,
    icon: 'S',
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Q1 Marketing Strategy Review',
    preview: "Let's analyze the campaign...",
    messages: 23,
    timeAgo: '2h ago',
    icon: 'Q',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Design System Refinements',
    preview: 'The new color palette looks much...',
    messages: 31,
    timeAgo: '1d ago',
    icon: 'D',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    title: 'Database Migration Planning',
    preview: 'We need to schedule the migration...',
    messages: 45,
    timeAgo: '1d ago',
    icon: 'D',
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '6',
    title: 'Customer Feedback Analysis',
    preview: 'The sentiment analysis reveals...',
    messages: 28,
    timeAgo: '2d ago',
    icon: 'C',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

export default function ChatsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>('3');

  const groupedChats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const filtered = MOCK_CHATS.filter((chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      pinned: filtered.filter((c) => c.isPinned),
      today: filtered.filter((c) => !c.isPinned && c.updatedAt >= today),
      yesterday: filtered.filter(
        (c) => !c.isPinned && c.updatedAt >= yesterday && c.updatedAt < today
      ),
      lastWeek: filtered.filter(
        (c) => !c.isPinned && c.updatedAt >= lastWeek && c.updatedAt < yesterday
      ),
    };
  }, [searchQuery]);

  return (
    <div className="flex flex-col">
      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--line-subtle)] bg-[var(--bg-surface)] py-2 pl-9 pr-3 text-[13px] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>
      </div>

      {/* Chat Groups */}
      <div className="space-y-6 px-4 pb-4">
        {/* Pinned */}
        {groupedChats.pinned.length > 0 && (
          <div>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Pinned
            </div>
            <div className="space-y-0.5">
              {groupedChats.pinned.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChat}
                  onClick={() => setActiveChat(chat.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Today */}
        {groupedChats.today.length > 0 && (
          <div>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Today
            </div>
            <div className="space-y-0.5">
              {groupedChats.today.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChat}
                  onClick={() => setActiveChat(chat.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Yesterday */}
        {groupedChats.yesterday.length > 0 && (
          <div>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Yesterday
            </div>
            <div className="space-y-0.5">
              {groupedChats.yesterday.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChat}
                  onClick={() => setActiveChat(chat.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Last 7 Days */}
        {groupedChats.lastWeek.length > 0 && (
          <div>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Last 7 days
            </div>
            <div className="space-y-0.5">
              {groupedChats.lastWeek.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChat}
                  onClick={() => setActiveChat(chat.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        @media (prefers-color-scheme: dark) {
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
          }

          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
    </div>
  );
}

function ChatItem({
  chat,
  isActive,
  onClick,
}: {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-lg px-3 py-2 text-left transition-all',
        isActive
          ? 'bg-[var(--bg-elev)] shadow-sm'
          : 'hover:bg-[var(--bg-elev)]'
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <div
          className={cn(
            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
            isActive
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
              : 'bg-[var(--bg-elev)] text-[var(--text-muted)]'
          )}
        >
          {chat.icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                'line-clamp-1 text-[14px] font-medium',
                isActive ? 'text-[var(--text)]' : 'text-[var(--text)]'
              )}
            >
              {chat.title}
            </h4>
            {chat.isPinned && (
              <Pin className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" fill="currentColor" />
            )}
          </div>

          <p className="mt-0.5 line-clamp-1 text-[12px] text-[var(--text-muted)]">
            {chat.preview}
          </p>

          <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <span>{chat.messages} messages</span>
            <span>•</span>
            <span>{chat.timeAgo}</span>
          </div>
        </div>

        {/* Context Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Open context menu
          }}
          className="opacity-0 transition-opacity group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4 text-[var(--text-muted)]" />
        </button>
      </div>
    </button>
  );
}
