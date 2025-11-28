import { create } from "zustand";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

type ListsState = {
  tasks: Task[];
  glow: boolean;
  addTask: (title: string) => void;
  removeTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  captureDetectedTasks: (titles: string[]) => void;
};

export const useListsStore = create<ListsState>((set) => ({
  tasks: [],
  glow: false,
  addTask: (title) =>
    set((state) => ({
      tasks: [...state.tasks, { id: crypto.randomUUID(), title, completed: false }],
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),
  toggleTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ),
    })),
  captureDetectedTasks: (titles) =>
    set((state) => {
      const newTasks = titles
        .filter((title) => !state.tasks.some((task) => task.title === title))
        .map((title) => ({ id: crypto.randomUUID(), title, completed: false }));
      return {
        tasks: [...state.tasks, ...newTasks],
        glow: newTasks.length > 0,
      };
    }),
}));
