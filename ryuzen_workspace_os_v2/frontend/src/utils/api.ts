import { fetchJSON } from "./fetcher";
import { ListItem, TaskItem, CalendarItem, ContentItem, ToronInsight } from "./models";

const API_BASE = "/api";

export const ListsApi = {
  async list(): Promise<ListItem[]> {
    return fetchJSON(`${API_BASE}/lists`);
  },
};

export const TasksApi = {
  async list(): Promise<TaskItem[]> {
    return fetchJSON(`${API_BASE}/tasks`);
  },
};

export const CalendarApi = {
  async list(): Promise<CalendarItem[]> {
    return fetchJSON(`${API_BASE}/calendar`);
  },
};

export const PagesApi = {
  async list(): Promise<ContentItem[]> {
    return fetchJSON(`${API_BASE}/pages`);
  },
};

export const ToronApi = {
  async insights(): Promise<ToronInsight[]> {
    return fetchJSON(`${API_BASE}/toron/insights`);
  },
};
