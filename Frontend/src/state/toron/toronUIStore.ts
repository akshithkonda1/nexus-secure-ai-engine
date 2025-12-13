import { create } from "zustand";
import { persist } from "zustand/middleware";

type SessionsWidgetState = "collapsed" | "expanded" | "hidden";

interface ToronUIStore {
  sessionsWidgetState: SessionsWidgetState;
  sessionsScrollTop: number;
  setSessionsWidgetState: (state: SessionsWidgetState) => void;
  setSessionsScrollTop: (top: number) => void;
}

export const useToronUIStore = create<ToronUIStore>()(
  persist(
    (set) => ({
      sessionsWidgetState: "collapsed",
      sessionsScrollTop: 0,
      setSessionsWidgetState: (state) => set({ sessionsWidgetState: state }),
      setSessionsScrollTop: (top) => set({ sessionsScrollTop: top }),
    }),
    {
      name: "toron-ui-store",
    },
  ),
);

export type { SessionsWidgetState };
