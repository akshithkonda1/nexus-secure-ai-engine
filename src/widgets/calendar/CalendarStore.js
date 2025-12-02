import { load, save } from "../../utils/localDB";

const STORAGE_KEY = "ryuzen_calendar_store";

const defaultState = {
  events: [],
};

let state = load(STORAGE_KEY, defaultState);

function persist() {
  save(STORAGE_KEY, state);
}

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `cal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const CalendarStore = {
  getAll() {
    return state;
  },
  addEvent(event) {
    const next = { ...event, id: uid() };
    state = { ...state, events: [...state.events, next] };
    persist();
    return next;
  },
  editEvent(id, updates) {
    state = {
      ...state,
      events: state.events.map((evt) => (evt.id === id ? { ...evt, ...updates } : evt)),
    };
    persist();
  },
  deleteEvent(id) {
    state = { ...state, events: state.events.filter((evt) => evt.id !== id) };
    persist();
  },
  getEventsForDay(dateString) {
    return state.events.filter((evt) => evt.date === dateString);
  },
};

export function exportCalendarData() {
  return CalendarStore.getAll();
}

export async function syncCalendarToCloud() {
  return Promise.resolve({ ok: true, payload: state });
}

export default CalendarStore;
