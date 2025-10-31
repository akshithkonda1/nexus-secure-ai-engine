import { create } from "zustand";
import { ACCENTS_STORAGE_KEY, getInitialAccentMap, type ModeKey } from "@/shared/lib/colors";

export type ThemePreference = "light" | "dark";
export type ModePreference = ModeKey;

export type SessionState = {
  activeChatId?: string;
  theme: ThemePreference;
  mode: ModePreference;
  accents: Record<ModePreference, string>;
  setActiveChatId: (id?: string) => void;
  setTheme: (theme: ThemePreference) => void;
  setMode: (mode: ModePreference) => void;
  setAccent: (mode: ModePreference, accent: string) => void;
};

const THEME_STORAGE_KEY = "nexus.theme";
const MODE_STORAGE_KEY = "nexus.mode";

const readTheme = (): ThemePreference => {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
};

const readMode = (): ModePreference => {
  if (typeof window === "undefined") {
    return "nexusos";
  }
  const stored = window.localStorage.getItem(MODE_STORAGE_KEY) as ModePreference | null;
  return stored === "student" || stored === "business" || stored === "nexusos" ? stored : "nexusos";
};

export const useSessionStore = create<SessionState>((set) => ({
  theme: readTheme(),
  mode: readMode(),
  accents: getInitialAccentMap(),
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    set({ theme });
  },
  setMode: (mode) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(MODE_STORAGE_KEY, mode);
    }
    set({ mode });
  },
  setAccent: (mode, accent) => {
    set((state) => {
      const next = { ...state.accents, [mode]: accent };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ACCENTS_STORAGE_KEY, JSON.stringify(next));
      }
      return { accents: next };
    });
  }
}));
