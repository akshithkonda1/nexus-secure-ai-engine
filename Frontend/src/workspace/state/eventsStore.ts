import { create } from "zustand";

export type WorkspaceEvent = {
  id: string;
  description: string;
  timestamp: string;
};

type EventsState = {
  events: WorkspaceEvent[];
  addEvent: (event: WorkspaceEvent) => void;
};

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 50),
    })),
}));
