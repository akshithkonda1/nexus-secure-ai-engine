/**
 * useChats Hook
 * Manages chat conversations with realistic mock data
 * Design: Time-grouped, searchable, with CRUD operations
 */

import { useState, useMemo } from 'react';
import { Chat, ChatGroup } from '../types/toron';

// Realistic mock data - varied timestamps and content
const generateMockChats = (): Chat[] => {
  const now = new Date();

  return [
    // Today
    {
      id: 'chat-1',
      title: 'Q1 Marketing Strategy Review',
      preview: 'Let\'s analyze the campaign performance metrics...',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      messageCount: 23,
      isActive: true,
      isPinned: false,
    },
    {
      id: 'chat-2',
      title: 'API Rate Limiting Implementation',
      preview: 'We should consider using Redis for distributed rate limiting...',
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      updatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      messageCount: 17,
      isPinned: true,
    },

    // Yesterday
    {
      id: 'chat-3',
      title: '🎨 Design System Refinements',
      preview: 'The new color palette looks much more cohesive...',
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      messageCount: 31,
    },
    {
      id: 'chat-4',
      title: 'Database Migration Planning',
      preview: 'We need to schedule the migration during low-traffic hours...',
      createdAt: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000),
      messageCount: 45,
    },

    // Last 7 days
    {
      id: 'chat-5',
      title: 'Customer Feedback Analysis',
      preview: 'The sentiment analysis reveals interesting patterns...',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      messageCount: 28,
    },
    {
      id: 'chat-6',
      title: 'Security Audit Preparation',
      preview: 'Let\'s review the authentication flow and token management...',
      createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      messageCount: 52,
      isPinned: true,
    },
    {
      id: 'chat-7',
      title: 'Performance Optimization Ideas',
      preview: 'Lazy loading images could reduce initial bundle size by 40%...',
      createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      messageCount: 19,
    },

    // Last 30 days
    {
      id: 'chat-8',
      title: 'Team Onboarding Documentation',
      preview: 'The new developer guide should include setup instructions...',
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      messageCount: 34,
    },
    {
      id: 'chat-9',
      title: 'Mobile App Feature Roadmap',
      preview: 'Push notifications should be our top priority...',
      createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      messageCount: 41,
    },
    {
      id: 'chat-10',
      title: 'Infrastructure Cost Reduction',
      preview: 'Switching to spot instances could save 60% on compute...',
      createdAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000),
      messageCount: 25,
    },
    {
      id: 'chat-11',
      title: '📊 Analytics Dashboard Redesign',
      preview: 'Real-time charts with WebSocket updates would be amazing...',
      createdAt: new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000),
      messageCount: 38,
    },

    // Older
    {
      id: 'chat-12',
      title: 'Content Moderation Strategy',
      preview: 'We should implement both automated and manual review...',
      createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      messageCount: 67,
    },
    {
      id: 'chat-13',
      title: 'Email Campaign Templates',
      preview: 'The welcome series needs better personalization...',
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      messageCount: 29,
    },
    {
      id: 'chat-14',
      title: 'API Documentation Updates',
      preview: 'All endpoints should have request/response examples...',
      createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
      messageCount: 44,
    },
    {
      id: 'chat-15',
      title: 'User Testing Insights',
      preview: 'Most users struggle with the checkout flow...',
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      messageCount: 56,
    },
  ];
};

export function useChats() {
  const [chats, setChats] = useState<Chat[]>(generateMockChats());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>('chat-1');

  // Filter chats by search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    const query = searchQuery.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.title.toLowerCase().includes(query) ||
        chat.preview?.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  // Group chats by time
  const groupedChats = useMemo((): ChatGroup[] => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const groups: ChatGroup[] = [
      { label: 'Pinned', chats: [] },
      { label: 'Today', chats: [] },
      { label: 'Yesterday', chats: [] },
      { label: 'Last 7 days', chats: [] },
      { label: 'Last 30 days', chats: [] },
      { label: 'Older', chats: [] },
    ];

    // Separate pinned chats
    const pinnedChats = filteredChats.filter((chat) => chat.isPinned);
    const unpinnedChats = filteredChats.filter((chat) => !chat.isPinned);

    groups[0].chats = pinnedChats;

    unpinnedChats.forEach((chat) => {
      const chatDate = chat.updatedAt;

      if (chatDate.toDateString() === now.toDateString()) {
        groups[1].chats.push(chat);
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        groups[2].chats.push(chat);
      } else if (chatDate >= lastWeek) {
        groups[3].chats.push(chat);
      } else if (chatDate >= lastMonth) {
        groups[4].chats.push(chat);
      } else {
        groups[5].chats.push(chat);
      }
    });

    // Filter out empty groups
    return groups.filter((group) => group.chats.length > 0);
  }, [filteredChats]);

  // CRUD operations
  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  };

  const renameChat = (chatId: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  };

  const pinChat = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );
  };

  const createChat = (title: string) => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title,
      preview: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
    return newChat;
  };

  return {
    chats: filteredChats,
    groupedChats,
    searchQuery,
    setSearchQuery,
    activeChat,
    setActiveChat,
    deleteChat,
    renameChat,
    pinChat,
    createChat,
  };
}
