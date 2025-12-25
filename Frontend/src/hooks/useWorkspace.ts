import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// TYPES
// ============================================================================

export type ListItem = {
  id: string;
  text: string;
  done: boolean;
  createdAt: Date;
};

export type List = {
  id: string;
  name: string;
  items: ListItem[];
  color?: string;
};

export type Task = {
  id: string;
  title: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color?: string;
};

export type Connector = {
  id: string;
  name: string;
  type: 'github' | 'notion' | 'linear' | 'slack';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
};

// ============================================================================
// STATE INTERFACE
// ============================================================================

type WorkspaceState = {
  // Data
  lists: List[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  connectors: Connector[];

  // List actions
  addList: (name: string) => void;
  removeList: (listId: string) => void;
  addListItem: (listId: string, text: string) => void;
  toggleListItem: (listId: string, itemId: string) => void;
  removeListItem: (listId: string, itemId: string) => void;

  // Task actions
  addTask: (title: string, priority?: 'low' | 'medium' | 'high') => void;
  toggleTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
  updateTaskPriority: (taskId: string, priority: 'low' | 'medium' | 'high') => void;

  // Calendar actions
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  removeEvent: (eventId: string) => void;

  // Connector actions
  toggleConnector: (connectorId: string) => void;
  updateConnectorStatus: (connectorId: string, status: Connector['status']) => void;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================================================
// STORE
// ============================================================================

export const useWorkspace = create<WorkspaceState>()(
  persist(
    (set) => ({
      // Initial state with sample data
      lists: [
        {
          id: '1',
          name: 'Research',
          items: [
            { id: '1-1', text: 'Read market analysis', done: false, createdAt: new Date() },
            { id: '1-2', text: 'Review competitor products', done: true, createdAt: new Date() },
          ],
        },
        {
          id: '2',
          name: 'Delivery',
          items: [
            { id: '2-1', text: 'Ship MVP features', done: false, createdAt: new Date() },
          ],
        },
        {
          id: '3',
          name: 'Backlog',
          items: [],
        },
      ],

      tasks: [
        { id: '1', title: 'Quick add', done: false, priority: 'high', createdAt: new Date() },
        { id: '2', title: 'Set next milestone', done: false, priority: 'medium', createdAt: new Date() },
        { id: '3', title: 'Review blockers', done: true, priority: 'low', createdAt: new Date() },
        { id: '4', title: 'Prep calm update', done: false, priority: 'medium', createdAt: new Date() },
      ],

      calendarEvents: [
        {
          id: '1',
          title: 'Design sync',
          start: new Date(2024, 11, 25, 9, 30),
          end: new Date(2024, 11, 25, 10, 30),
          description: '3 teammates',
          color: '#8b5cf6',
        },
        {
          id: '2',
          title: 'Client window',
          start: new Date(2024, 11, 25, 12, 0),
          end: new Date(2024, 11, 25, 13, 0),
          description: 'Calm check-in',
          color: '#3b82f6',
        },
        {
          id: '3',
          title: 'Focus block',
          start: new Date(2024, 11, 25, 15, 30),
          end: new Date(2024, 11, 25, 17, 30),
          description: 'Reserved',
          color: '#10b981',
        },
      ],

      connectors: [
        { id: '1', name: 'GitHub', type: 'github', status: 'connected', lastSync: new Date() },
        { id: '2', name: 'Notion', type: 'notion', status: 'disconnected' },
        { id: '3', name: 'Linear', type: 'linear', status: 'connected', lastSync: new Date() },
      ],

      // ========================================================================
      // LIST ACTIONS
      // ========================================================================

      addList: (name) =>
        set((state) => ({
          lists: [...state.lists, { id: generateId(), name, items: [] }],
        })),

      removeList: (listId) =>
        set((state) => ({
          lists: state.lists.filter((l) => l.id !== listId),
        })),

      addListItem: (listId, text) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: [
                    ...list.items,
                    { id: generateId(), text, done: false, createdAt: new Date() },
                  ],
                }
              : list
          ),
        })),

      toggleListItem: (listId, itemId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.id === itemId ? { ...item, done: !item.done } : item
                  ),
                }
              : list
          ),
        })),

      removeListItem: (listId, itemId) =>
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
              : list
          ),
        })),

      // ========================================================================
      // TASK ACTIONS
      // ========================================================================

      addTask: (title, priority = 'medium') =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { id: generateId(), title, done: false, priority, createdAt: new Date() },
          ],
        })),

      toggleTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, done: !task.done } : task
          ),
        })),

      removeTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),

      updateTaskPriority: (taskId, priority) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, priority } : task
          ),
        })),

      // ========================================================================
      // CALENDAR ACTIONS
      // ========================================================================

      addEvent: (event) =>
        set((state) => ({
          calendarEvents: [...state.calendarEvents, { id: generateId(), ...event }],
        })),

      removeEvent: (eventId) =>
        set((state) => ({
          calendarEvents: state.calendarEvents.filter((e) => e.id !== eventId),
        })),

      // ========================================================================
      // CONNECTOR ACTIONS
      // ========================================================================

      toggleConnector: (connectorId) =>
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === connectorId
              ? {
                  ...c,
                  status: c.status === 'connected' ? 'disconnected' : 'connected',
                  lastSync: c.status === 'disconnected' ? new Date() : c.lastSync,
                }
              : c
          ),
        })),

      updateConnectorStatus: (connectorId, status) =>
        set((state) => ({
          connectors: state.connectors.map((c) =>
            c.id === connectorId
              ? { ...c, status, lastSync: status === 'connected' ? new Date() : c.lastSync }
              : c
          ),
        })),
    }),
    {
      name: 'workspace-storage',
    }
  )
);
