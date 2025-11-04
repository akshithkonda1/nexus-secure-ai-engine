// Frontend/src/stores/themeStore.ts
import { create } from "zustand";

export type Theme = "light" | "dark";
const LS_KEY = "nexus.theme";

type ThemeState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode, options?: { persist?: boolean }) => void;
  toggleTheme: () => void;
};

function applyTheme(theme: Theme) {
  const root = document.documentElement; // <html>
  root.setAttribute("data-theme", theme);
  // if you also switch logos elsewhere by data-theme, this is enough
}

const applyTheme = (theme: ThemeMode) => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
  if (typeof document !== "undefined") {
    document.body.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue("--bg");
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",

const initialTheme = readStoredTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  setTheme: (nextTheme, options) => {
    applyTheme(nextTheme);
    if (typeof window !== "undefined" && options?.persist !== false) {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    }
    set({ theme: nextTheme });
  },
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === "dark" ? "light" : "dark";
    get().setTheme(nextTheme);
  },
}));

if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemTheme = (event: MediaQueryListEvent) => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === "light" || stored === "dark") {
      return;
    }
    const nextTheme: ThemeMode = event.matches ? "dark" : "light";
    useThemeStore.getState().setTheme(nextTheme, { persist: false });
  };
  mediaQuery.addEventListener("change", handleSystemTheme);
}

export type { ThemeMode };
