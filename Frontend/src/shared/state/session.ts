import { create } from "zustand";

export type ThemePreference = "light" | "dark";
export type ModePreference = "student" | "business" | "nexusos";

export type SessionState = {
  activeChatId?: string;
  theme: ThemePreference;
  mode: ModePreference;
  setActiveChatId: (id?: string) => void;
  setTheme: (theme: ThemePreference) => void;
  setMode: (mode: ModePreference) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  theme: "light",
  mode: "nexusos",
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  setTheme: (theme) => set({ theme }),
  setMode: (mode) => set({ mode })
}));
