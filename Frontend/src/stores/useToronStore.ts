/**
 * Toron Store - World-Class AI Chat State Management
 * Zustand store with persistence for Toron AI interface
 *
 * Features:
 * - Chat CRUD with message management
 * - Project organization
 * - Integration management
 * - Streaming state support
 * - Full localStorage persistence with Date serialization
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'github' | 'drive' | 'url' | 'code';
  size?: number;
  url?: string;
  preview?: string;
  metadata?: {
    mimeType?: string;
    width?: number;
    height?: number;
    language?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  streamingContent?: string;
  error?: boolean;
  attachments?: Attachment[];
  metadata?: {
    model?: string;
    tokens?: number;
    latency?: number;
    confidence?: number;
  };
}

export interface Chat {
  id: string;
  title: string;
  preview?: string;
  messageCount: number;
  updatedAt: Date;
  createdAt: Date;
  isPinned: boolean;
  messages: Message[];
  model?: string;
  systemPrompt?: string;
  temperature?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  chatIds: string[];
  updatedAt: Date;
  createdAt: Date;
  archived: boolean;
  color?: string;
  icon?: string;
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  description: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  scopes?: string[];
}

export type MenuType = 'chats' | 'projects';

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface ToronState {
  // Data
  chats: Chat[];
  projects: Project[];
  integrations: Integration[];

  // UI State
  activeChat: string | null;
  activeProject: string | null;
  activeMenu: MenuType;
  searchQuery: string;
  isStreaming: boolean;
  streamingChatId: string | null;

  // Chat Actions
  createChat: (title?: string, model?: string) => string;
  deleteChat: (chatId: string) => void;
  updateChat: (chatId: string, updates: Partial<Omit<Chat, 'id' | 'messages'>>) => void;
  pinChat: (chatId: string) => void;
  unpinChat: (chatId: string) => void;
  duplicateChat: (chatId: string) => string;
  setActiveChat: (chatId: string | null) => void;

  // Message Actions
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  clearMessages: (chatId: string) => void;

  // Streaming Actions
  setStreaming: (isStreaming: boolean, chatId?: string | null) => void;

  // Project Actions
  createProject: (name: string, description?: string, color?: string) => string;
  deleteProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Omit<Project, 'id'>>) => void;
  addChatToProject: (projectId: string, chatId: string) => void;
  removeChatFromProject: (projectId: string, chatId: string) => void;
  archiveProject: (projectId: string) => void;
  unarchiveProject: (projectId: string) => void;
  setActiveProject: (projectId: string | null) => void;

  // Integration Actions
  connectIntegration: (integrationId: string, token?: string) => void;
  disconnectIntegration: (integrationId: string) => void;
  updateIntegration: (integrationId: string, updates: Partial<Integration>) => void;

  // UI Actions
  setActiveMenu: (menu: MenuType) => void;
  setSearchQuery: (query: string) => void;

  // Utility
  getChatById: (chatId: string) => Chat | undefined;
  getProjectById: (projectId: string) => Project | undefined;
  getFilteredChats: () => Chat[];
  getFilteredProjects: () => Project[];
  getChatGroups: () => { label: string; chats: Chat[] }[];
}

// ============================================================================
// INITIAL DATA
// ============================================================================

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    icon: 'github',
    connected: false,
    description: 'Access repositories and code',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    icon: 'folder-open',
    connected: false,
    description: 'Search and attach files',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: 'file-text',
    connected: false,
    description: 'Connect your workspace',
  },
  {
    id: 'linear',
    name: 'Linear',
    icon: 'code',
    connected: false,
    description: 'Access issues and projects',
  },
  {
    id: 'database',
    name: 'Database',
    icon: 'database',
    connected: false,
    description: 'Query your data',
  },
  {
    id: 'web',
    name: 'Web Search',
    icon: 'globe',
    connected: true,
    description: 'Search the internet',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = (prefix: string = 'id') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

const isThisWeek = (date: Date): boolean => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo && !isToday(date) && !isYesterday(date);
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useToronStore = create<ToronState>()(
  persist<ToronState>(
    (set, get) => ({
      // ========================================
      // INITIAL STATE
      // ========================================
      chats: [],
      projects: [],
      integrations: INITIAL_INTEGRATIONS,
      activeChat: null,
      activeProject: null,
      activeMenu: 'chats',
      searchQuery: '',
      isStreaming: false,
      streamingChatId: null,

      // ========================================
      // CHAT ACTIONS
      // ========================================

      createChat: (title?: string, model?: string) => {
        const chatId = generateId('chat');
        const now = new Date();

        const newChat: Chat = {
          id: chatId,
          title: title || 'New Chat',
          messageCount: 0,
          updatedAt: now,
          createdAt: now,
          isPinned: false,
          messages: [],
          model: model || 'claude-sonnet-4',
        };

        set(state => ({
          chats: [newChat, ...state.chats],
          activeChat: chatId,
        }));

        return chatId;
      },

      deleteChat: (chatId: string) => {
        set(state => {
          const newChats = state.chats.filter(c => c.id !== chatId);
          const newActiveChat = state.activeChat === chatId
            ? (newChats.length > 0 ? newChats[0].id : null)
            : state.activeChat;

          // Also remove from projects
          const newProjects = state.projects.map(p => ({
            ...p,
            chatIds: p.chatIds.filter(id => id !== chatId),
          }));

          return {
            chats: newChats,
            activeChat: newActiveChat,
            projects: newProjects,
          };
        });
      },

      updateChat: (chatId: string, updates: Partial<Omit<Chat, 'id' | 'messages'>>) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, ...updates, updatedAt: new Date() }
              : chat
          ),
        }));
      },

      pinChat: (chatId: string) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, isPinned: true, updatedAt: new Date() }
              : chat
          ),
        }));
      },

      unpinChat: (chatId: string) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, isPinned: false, updatedAt: new Date() }
              : chat
          ),
        }));
      },

      duplicateChat: (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId);
        if (!chat) return '';

        const newChatId = generateId('chat');
        const now = new Date();

        const duplicatedChat: Chat = {
          ...chat,
          id: newChatId,
          title: `${chat.title} (copy)`,
          createdAt: now,
          updatedAt: now,
          isPinned: false,
          messages: chat.messages.map(msg => ({
            ...msg,
            id: generateId('msg'),
            timestamp: new Date(msg.timestamp),
          })),
        };

        set(state => ({
          chats: [duplicatedChat, ...state.chats],
          activeChat: newChatId,
        }));

        return newChatId;
      },

      setActiveChat: (chatId: string | null) => {
        set({ activeChat: chatId });
      },

      // ========================================
      // MESSAGE ACTIONS
      // ========================================

      addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const messageId = generateId('msg');
        const now = new Date();

        const newMessage: Message = {
          ...message,
          id: messageId,
          timestamp: now,
        };

        set(state => ({
          chats: state.chats.map(chat => {
            if (chat.id !== chatId) return chat;

            const newMessages = [...chat.messages, newMessage];

            // Auto-generate title from first user message
            let title = chat.title;
            if (title === 'New Chat' && message.role === 'user' && chat.messages.length === 0) {
              title = message.content.slice(0, 50) +
                     (message.content.length > 50 ? '...' : '');
            }

            return {
              ...chat,
              messages: newMessages,
              messageCount: newMessages.length,
              preview: message.role === 'user'
                ? message.content.slice(0, 100)
                : chat.preview,
              updatedAt: now,
              title,
            };
          }),
        }));

        return messageId;
      },

      updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => {
        set(state => ({
          chats: state.chats.map(chat => {
            if (chat.id !== chatId) return chat;

            return {
              ...chat,
              messages: chat.messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, ...updates }
                  : msg
              ),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      deleteMessage: (chatId: string, messageId: string) => {
        set(state => ({
          chats: state.chats.map(chat => {
            if (chat.id !== chatId) return chat;

            const newMessages = chat.messages.filter(msg => msg.id !== messageId);

            return {
              ...chat,
              messages: newMessages,
              messageCount: newMessages.length,
              updatedAt: new Date(),
            };
          }),
        }));
      },

      clearMessages: (chatId: string) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, messages: [], messageCount: 0, updatedAt: new Date() }
              : chat
          ),
        }));
      },

      // ========================================
      // STREAMING ACTIONS
      // ========================================

      setStreaming: (isStreaming: boolean, chatId: string | null = null) => {
        set({ isStreaming, streamingChatId: isStreaming ? chatId : null });
      },

      // ========================================
      // PROJECT ACTIONS
      // ========================================

      createProject: (name: string, description?: string, color?: string) => {
        const projectId = generateId('project');
        const now = new Date();

        const newProject: Project = {
          id: projectId,
          name,
          description,
          chatIds: [],
          createdAt: now,
          updatedAt: now,
          archived: false,
          color: color || '#3b82f6',
        };

        set(state => ({
          projects: [newProject, ...state.projects],
          activeProject: projectId,
        }));

        return projectId;
      },

      deleteProject: (projectId: string) => {
        set(state => {
          const newProjects = state.projects.filter(p => p.id !== projectId);
          const newActiveProject = state.activeProject === projectId
            ? (newProjects.length > 0 ? newProjects[0].id : null)
            : state.activeProject;

          return {
            projects: newProjects,
            activeProject: newActiveProject,
          };
        });
      },

      updateProject: (projectId: string, updates: Partial<Omit<Project, 'id'>>) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          ),
        }));
      },

      addChatToProject: (projectId: string, chatId: string) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === projectId && !project.chatIds.includes(chatId)
              ? { ...project, chatIds: [...project.chatIds, chatId], updatedAt: new Date() }
              : project
          ),
        }));
      },

      removeChatFromProject: (projectId: string, chatId: string) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? { ...project, chatIds: project.chatIds.filter(id => id !== chatId), updatedAt: new Date() }
              : project
          ),
        }));
      },

      archiveProject: (projectId: string) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? { ...project, archived: true, updatedAt: new Date() }
              : project
          ),
        }));
      },

      unarchiveProject: (projectId: string) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? { ...project, archived: false, updatedAt: new Date() }
              : project
          ),
        }));
      },

      setActiveProject: (projectId: string | null) => {
        set({ activeProject: projectId });
      },

      // ========================================
      // INTEGRATION ACTIONS
      // ========================================

      connectIntegration: (integrationId: string, token?: string) => {
        set(state => ({
          integrations: state.integrations.map(integration =>
            integration.id === integrationId
              ? { ...integration, connected: true, accessToken: token }
              : integration
          ),
        }));
      },

      disconnectIntegration: (integrationId: string) => {
        set(state => ({
          integrations: state.integrations.map(integration =>
            integration.id === integrationId
              ? { ...integration, connected: false, accessToken: undefined, refreshToken: undefined }
              : integration
          ),
        }));
      },

      updateIntegration: (integrationId: string, updates: Partial<Integration>) => {
        set(state => ({
          integrations: state.integrations.map(integration =>
            integration.id === integrationId
              ? { ...integration, ...updates }
              : integration
          ),
        }));
      },

      // ========================================
      // UI ACTIONS
      // ========================================

      setActiveMenu: (menu: MenuType) => {
        set({ activeMenu: menu });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // ========================================
      // UTILITY GETTERS
      // ========================================

      getChatById: (chatId: string) => {
        return get().chats.find(c => c.id === chatId);
      },

      getProjectById: (projectId: string) => {
        return get().projects.find(p => p.id === projectId);
      },

      getFilteredChats: () => {
        const { chats, searchQuery } = get();

        if (!searchQuery.trim()) {
          return chats;
        }

        const query = searchQuery.toLowerCase();
        return chats.filter(chat =>
          chat.title.toLowerCase().includes(query) ||
          chat.preview?.toLowerCase().includes(query) ||
          chat.messages.some(msg =>
            msg.content.toLowerCase().includes(query)
          )
        );
      },

      getFilteredProjects: () => {
        const { projects, searchQuery } = get();

        if (!searchQuery.trim()) {
          return projects.filter(p => !p.archived);
        }

        const query = searchQuery.toLowerCase();
        return projects.filter(project =>
          !project.archived && (
            project.name.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query)
          )
        );
      },

      getChatGroups: () => {
        const chats = get().getFilteredChats();

        const pinned = chats.filter(c => c.isPinned);
        const today = chats.filter(c => !c.isPinned && isToday(c.updatedAt));
        const yesterday = chats.filter(c => !c.isPinned && isYesterday(c.updatedAt));
        const thisWeek = chats.filter(c => !c.isPinned && isThisWeek(c.updatedAt));
        const older = chats.filter(c =>
          !c.isPinned &&
          !isToday(c.updatedAt) &&
          !isYesterday(c.updatedAt) &&
          !isThisWeek(c.updatedAt)
        );

        const groups: { label: string; chats: Chat[] }[] = [];

        if (pinned.length > 0) groups.push({ label: 'Pinned', chats: pinned });
        if (today.length > 0) groups.push({ label: 'Today', chats: today });
        if (yesterday.length > 0) groups.push({ label: 'Yesterday', chats: yesterday });
        if (thisWeek.length > 0) groups.push({ label: 'This Week', chats: thisWeek });
        if (older.length > 0) groups.push({ label: 'Older', chats: older });

        return groups;
      },
    }),
    {
      name: 'ryuzen-toron-storage',
      version: 1,

      // Custom storage with Date serialization
      storage: createJSONStorage(() => localStorage, {
        reviver: (_key, value) => {
          // Revive Date objects
          if (typeof value === 'string') {
            // Check if it's an ISO date string
            const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
            if (dateRegex.test(value)) {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                return date;
              }
            }
          }
          return value;
        },
        replacer: (_key, value) => {
          // Dates are already serialized properly by JSON.stringify
          return value;
        },
      }),

      // Only persist data, not UI state
      partialize: (state: ToronState) => ({
        chats: state.chats,
        projects: state.projects,
        integrations: state.integrations,
        activeChat: state.activeChat,
        activeProject: state.activeProject,
      }) as ToronState,

      // Migration for version updates
      migrate: (persistedState: unknown, version: number): ToronState => {
        const state = persistedState as Partial<ToronState>;
        if (version === 0) {
          // Initial migration - ensure all dates are Date objects
          return {
            ...state,
            chats: (state.chats || []).map(chat => ({
              ...chat,
              createdAt: new Date(chat.createdAt),
              updatedAt: new Date(chat.updatedAt),
              messages: chat.messages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              })),
            })),
            projects: (state.projects || []).map(project => ({
              ...project,
              createdAt: new Date(project.createdAt),
              updatedAt: new Date(project.updatedAt),
            })),
          } as ToronState;
        }
        return persistedState as ToronState;
      },
    }
  )
);

// ============================================================================
// SELECTOR HOOKS FOR PERFORMANCE
// ============================================================================

// Use these for optimized re-renders
export const useActiveChat = () => useToronStore(state => {
  const chat = state.chats.find(c => c.id === state.activeChat);
  return chat;
});

export const useMessages = (chatId: string) => useToronStore(state => {
  const chat = state.chats.find(c => c.id === chatId);
  return chat?.messages || [];
});

export const useChatGroups = () => useToronStore(state => state.getChatGroups());

export const useFilteredProjects = () => useToronStore(state => state.getFilteredProjects());

export const useIsStreaming = () => useToronStore(state => ({
  isStreaming: state.isStreaming,
  streamingChatId: state.streamingChatId,
}));

export default useToronStore;
