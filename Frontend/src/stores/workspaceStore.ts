import { create } from 'zustand';

// ============================================================================
// TYPES - Keep Simple
// ============================================================================

export type ListItem = {
  id: string;
  text: string;
  done: boolean;
};

export type List = {
  id: string;
  name: string;
  items: ListItem[];
};

export type Task = {
  id: string;
  title: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
};

// ============================================================================
// STORE - No Persist Yet
// ============================================================================

type WorkspaceStore = {
  // Data
  lists: List[];
  tasks: Task[];

  // List Actions
  addListItem: (listId: string, text: string) => void;
  toggleListItem: (listId: string, itemId: string) => void;
  removeListItem: (listId: string, itemId: string) => void;

  // Task Actions
  addTask: (title: string, priority?: 'low' | 'medium' | 'high') => void;
  toggleTask: (taskId: string) => void;
  removeTask: (taskId: string) => void;
};

// Helper
const generateId = () => Math.random().toString(36).substr(2, 9);

// ============================================================================
// CREATE STORE
// ============================================================================

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  // Initial data - simple and working
  lists: [
    {
      id: '1',
      name: 'Research',
      items: [
        { id: '1-1', text: 'Read market analysis', done: false },
        { id: '1-2', text: 'Review competitors', done: true },
      ],
    },
    {
      id: '2',
      name: 'Delivery',
      items: [{ id: '2-1', text: 'Ship MVP', done: false }],
    },
  ],

  tasks: [
    { id: '1', title: 'Quick add', done: false, priority: 'high' },
    { id: '2', title: 'Set milestone', done: false, priority: 'medium' },
    { id: '3', title: 'Review blockers', done: true, priority: 'low' },
  ],

  // ============================================================================
  // LIST ACTIONS
  // ============================================================================

  addListItem: (listId, text) => {
    console.log('Adding item:', text, 'to list:', listId);
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [...list.items, { id: generateId(), text, done: false }],
            }
          : list
      ),
    }));
  },

  toggleListItem: (listId, itemId) => {
    console.log('Toggling item:', itemId, 'in list:', listId);
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
    }));
  },

  removeListItem: (listId, itemId) => {
    console.log('Removing item:', itemId, 'from list:', listId);
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
          : list
      ),
    }));
  },

  // ============================================================================
  // TASK ACTIONS
  // ============================================================================

  addTask: (title, priority = 'medium') => {
    console.log('Adding task:', title, 'priority:', priority);
    set((state) => ({
      tasks: [...state.tasks, { id: generateId(), title, done: false, priority }],
    }));
  },

  toggleTask: (taskId) => {
    console.log('Toggling task:', taskId);
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task
      ),
    }));
  },

  removeTask: (taskId) => {
    console.log('Removing task:', taskId);
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  },
}));
