import { load, save } from "../../utils/localDB";
import { CalendarStore } from "../calendar/CalendarStore";

const STORAGE_KEY = "ryuzen_tasks_store";

const defaultState = {
  tasks: [],
};

let state = load(STORAGE_KEY, defaultState);

function persist() {
  save(STORAGE_KEY, state);
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority === b.priority) return (a.time || "").localeCompare(b.time || "");
    const order = { high: 0, medium: 1, low: 2, none: 3 };
    return order[a.priority || "none"] - order[b.priority || "none"];
  });
}

export const TasksStore = {
  getAll() {
    return { ...state, tasks: sortTasks(state.tasks) };
  },
  addTask(task) {
    const next = { ...task, id: uid(), completed: false };
    state = { ...state, tasks: [...state.tasks, next] };
    persist();
    return next;
  },
  updateTask(id, updates) {
    state = { ...state, tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)) };
    persist();
  },
  toggleComplete(id) {
    state = {
      ...state,
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    };
    persist();
  },
  reorderTasks(currentIndex, nextIndex) {
    const tasks = [...state.tasks];
    const [removed] = tasks.splice(currentIndex, 1);
    tasks.splice(nextIndex, 0, removed);
    state = { ...state, tasks };
    persist();
  },
  generateFromCalendar() {
    const events = CalendarStore.getAll().events;
    const generated = events.map((evt) => ({
      id: uid(),
      text: evt.title,
      time: evt.time,
      completed: false,
      categoryTag: evt.type,
      priority: evt.type === "critical" ? "high" : "medium",
    }));
    state = { ...state, tasks: [...state.tasks, ...generated] };
    persist();
    return generated;
  },
  optimizeTasks(tasks) {
    const optimized = sortTasks(tasks);
    state = { ...state, tasks: optimized };
    persist();
    return optimized;
  },
};

export function exportTasksData() {
  return TasksStore.getAll();
}

export default TasksStore;
