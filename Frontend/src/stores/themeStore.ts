import { create } from "zustand";

type ThemeMode = "light" | "dark";

type ThemeState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "nexus.theme";

const applyTheme = (theme: ThemeMode) => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
};

const readStoredTheme = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "dark";
  }
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? true;
  return prefersDark ? "dark" : "light";
};

const initialTheme = readStoredTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  setTheme: (nextTheme) => {
    applyTheme(nextTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    }
    set({ theme: nextTheme });
  },
  toggleTheme: () => {
    set((state) => {
      const nextTheme: ThemeMode = state.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      }
      return { theme: nextTheme };
    });
  },
}));

export type { ThemeMode };
