import { create } from "zustand";

export type CalendarEntry = {
  id: string;
  title: string;
  date: string;
};

type CalendarState = {
  horizon: 1 | 7 | 30 | 365;
  entries: CalendarEntry[];
  setHorizon: (value: CalendarState["horizon"]) => void;
  captureDetectedDates: (dates: { title: string; date: string }[]) => void;
};

export const useCalendarStore = create<CalendarState>((set) => ({
  horizon: 7,
  entries: [],
  setHorizon: (value) => set({ horizon: value }),
  captureDetectedDates: (dates) =>
    set((state) => ({
      entries: [
        ...state.entries,
        ...dates.map((entry) => ({
          id: crypto.randomUUID(),
          title: entry.title,
          date: entry.date,
        })),
      ],
    })),
}));
