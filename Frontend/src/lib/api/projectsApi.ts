import axios from "axios";

const api = axios.create({
  baseURL: "/api/projects",
  withCredentials: true,
});

export const ProjectsAPI = {
  list: () => api.get("/"),
  create: (payload: unknown) => api.post("/", payload),
  update: (id: string, payload: unknown) => api.put(`/${id}`, payload),
  remove: (id: string) => api.delete(`/${id}`),
  load: (id: string) => api.get(`/${id}`),
  saveMessages: (id: string, messages: unknown) => api.post(`/${id}/messages`, { messages }),
  saveMemory: (id: string, memory: unknown) => api.post(`/${id}/memory`, { memory }),
};
