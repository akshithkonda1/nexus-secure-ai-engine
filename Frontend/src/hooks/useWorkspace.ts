/**
 * Workspace State Management
 * Global state for all workspace data with Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorkspaceData,
  List,
  Task,
  CalendarEvent,
  Page,
  Note,
  Suggestion,
  AnalysisResult,
  PermissionScope,
} from '../types/workspace';

// Helper to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initial state
const initialState: WorkspaceData = {
  // Widget data (always accessible)
  lists: [
    {
      id: '1',
      name: 'Research',
      items: [
        { id: '1-1', text: 'Review AI papers', done: false },
        { id: '1-2', text: 'Benchmark models', done: true },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Delivery',
      items: [
        { id: '2-1', text: 'Ship v2.0', done: false },
        { id: '2-2', text: 'Update docs', done: false },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  tasks: [
    { id: '1', title: 'Set next milestone', done: false, priority: 80, type: 'work', createdAt: new Date() },
    { id: '2', title: 'Review blockers', done: true, priority: 60, type: 'work', createdAt: new Date() },
    { id: '3', title: 'Prep calm update', done: false, priority: 70, type: 'work', createdAt: new Date() },
  ],
  calendarEvents: [
    {
      id: '1',
      title: 'Design sync',
      start: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      end: new Date(Date.now() + 3 * 60 * 60 * 1000),
      type: 'meeting',
      priority: 70,
    },
    {
      id: '2',
      title: 'Client window',
      start: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      end: new Date(Date.now() + 6 * 60 * 60 * 1000),
      type: 'meeting',
      priority: 90,
    },
  ],
  connectors: [
    { id: '1', name: 'GitHub', type: 'github', connected: true, lastSync: new Date() },
    { id: '2', name: 'Notion', type: 'notion', connected: true, lastSync: new Date() },
    { id: '3', name: 'Linear', type: 'linear', connected: true, lastSync: new Date() },
  ],

  // Focus mode data (only for Analyze mode with permission)
  pages: [],
  notes: [],
  boards: [],
  flows: [],

  // Intelligence
  suggestions: [],
  analyses: [],

  // History for pattern detection
  history: {
    scheduling: [],
    preparation: [],
  },
};

interface WorkspaceState extends WorkspaceData {
  // Analyze mode permissions
  analyzePermission: PermissionScope | null;
  analyzePermissionGrantedAt: Date | null;

  // List operations
  addList: (name: string) => void;
  addListItem: (listId: string, text: string) => void;
  toggleListItem: (listId: string, itemId: string) => void;
  deleteListItem: (listId: string, itemId: string) => void;

  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Calendar operations
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Connector operations
  toggleConnector: (id: string) => void;
  syncConnector: (id: string) => void;

  // Page operations (Analyze mode only)
  addPage: (page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;

  // Note operations (Analyze mode only)
  addNote: (content: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;

  // Suggestion operations
  addSuggestion: (suggestion: Suggestion) => void;
  dismissSuggestion: (id: string) => void;
  acceptSuggestion: (id: string) => void;
  getSuggestionsByWidget: (widget: string) => Suggestion[];

  // Analyze mode
  grantAnalyzePermission: (scope: PermissionScope) => void;
  revokeAnalyzePermission: () => void;
  hasAnalyzePermission: () => boolean;

  // Analysis
  addAnalysis: (analysis: AnalysisResult) => void;
  clearAnalyses: () => void;

  // Utility
  clearAll: () => void;
}

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      ...initialState,
      analyzePermission: null,
      analyzePermissionGrantedAt: null,

      // List operations
      addList: (name: string) => {
        const newList: List = {
          id: generateId(),
          name,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ lists: [...state.lists, newList] }));
      },

      addListItem: (listId: string, text: string) => {
        set(state => ({
          lists: state.lists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: [
                    ...list.items,
                    { id: generateId(), text, done: false },
                  ],
                  updatedAt: new Date(),
                }
              : list
          ),
        }));
      },

      toggleListItem: (listId: string, itemId: string) => {
        set(state => ({
          lists: state.lists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map(item =>
                    item.id === itemId ? { ...item, done: !item.done } : item
                  ),
                  updatedAt: new Date(),
                }
              : list
          ),
        }));
      },

      deleteListItem: (listId: string, itemId: string) => {
        set(state => ({
          lists: state.lists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.filter(item => item.id !== itemId),
                  updatedAt: new Date(),
                }
              : list
          ),
        }));
      },

      // Task operations
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date(),
        };
        set(state => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id: string) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id),
        }));
      },

      toggleTask: (id: string) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, done: !task.done } : task
          ),
        }));
      },

      // Calendar operations
      addCalendarEvent: (eventData) => {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: generateId(),
        };
        set(state => ({
          calendarEvents: [...state.calendarEvents, newEvent],
        }));
      },

      updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => {
        set(state => ({
          calendarEvents: state.calendarEvents.map(event =>
            event.id === id ? { ...event, ...updates } : event
          ),
        }));
      },

      deleteCalendarEvent: (id: string) => {
        set(state => ({
          calendarEvents: state.calendarEvents.filter(event => event.id !== id),
        }));
      },

      // Connector operations
      toggleConnector: (id: string) => {
        set(state => ({
          connectors: state.connectors.map(connector =>
            connector.id === id
              ? { ...connector, connected: !connector.connected }
              : connector
          ),
        }));
      },

      syncConnector: (id: string) => {
        set(state => ({
          connectors: state.connectors.map(connector =>
            connector.id === id
              ? { ...connector, lastSync: new Date() }
              : connector
          ),
        }));
      },

      // Page operations
      addPage: (pageData) => {
        const newPage: Page = {
          ...pageData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set(state => ({ pages: [...state.pages, newPage] }));
      },

      updatePage: (id: string, updates: Partial<Page>) => {
        set(state => ({
          pages: state.pages.map(page =>
            page.id === id ? { ...page, ...updates, updatedAt: new Date() } : page
          ),
        }));
      },

      deletePage: (id: string) => {
        set(state => ({
          pages: state.pages.filter(page => page.id !== id),
        }));
      },

      // Note operations
      addNote: (content: string) => {
        const newNote: Note = {
          id: generateId(),
          content,
          createdAt: new Date(),
        };
        set(state => ({ notes: [...state.notes, newNote] }));
      },

      updateNote: (id: string, content: string) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === id ? { ...note, content } : note
          ),
        }));
      },

      deleteNote: (id: string) => {
        set(state => ({
          notes: state.notes.filter(note => note.id !== id),
        }));
      },

      // Suggestion operations
      addSuggestion: (suggestion: Suggestion) => {
        set(state => ({
          suggestions: [...state.suggestions, suggestion],
        }));
      },

      dismissSuggestion: (id: string) => {
        set(state => ({
          suggestions: state.suggestions.filter(s => s.id !== id),
        }));
      },

      acceptSuggestion: (id: string) => {
        const suggestion = get().suggestions.find(s => s.id === id);
        if (suggestion && suggestion.actions.length > 0) {
          // Execute first action
          suggestion.actions[0].execute();
        }
        get().dismissSuggestion(id);
      },

      getSuggestionsByWidget: (widget: string) => {
        return get().suggestions.filter(s => s.source.widget === widget);
      },

      // Analyze mode
      grantAnalyzePermission: (scope: PermissionScope) => {
        set({
          analyzePermission: scope,
          analyzePermissionGrantedAt: new Date(),
        });
      },

      revokeAnalyzePermission: () => {
        set({
          analyzePermission: null,
          analyzePermissionGrantedAt: null,
        });
      },

      hasAnalyzePermission: () => {
        const { analyzePermission, analyzePermissionGrantedAt } = get();

        if (!analyzePermission) return false;

        // 'analysis' scope expires immediately after use
        if (analyzePermission === 'analysis') {
          return false;
        }

        // 'session' scope expires when permission was granted more than 24 hours ago
        if (analyzePermission === 'session' && analyzePermissionGrantedAt) {
          const hoursSinceGrant =
            (Date.now() - analyzePermissionGrantedAt.getTime()) / (1000 * 60 * 60);
          return hoursSinceGrant < 24;
        }

        // 'always' scope never expires
        return analyzePermission === 'always';
      },

      // Analysis
      addAnalysis: (analysis: AnalysisResult) => {
        set(state => ({
          analyses: [...state.analyses, analysis],
        }));
      },

      clearAnalyses: () => {
        set({ analyses: [] });
      },

      // Utility
      clearAll: () => {
        set(initialState);
      },
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        // Persist widget data
        lists: state.lists,
        tasks: state.tasks,
        calendarEvents: state.calendarEvents,
        connectors: state.connectors,
        // Don't persist focus mode data (privacy)
        // Don't persist suggestions (ephemeral)
        // Don't persist analyses (ephemeral)
        // Don't persist permissions (must re-grant each session for 'session' scope)
      }),
    }
  )
);
