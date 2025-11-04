// Frontend/src/stores/themeStore.ts
import { create } from "zustand";

export type Theme = "light" | "dark";
const LS_KEY = "nexus.theme";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement; // <html>
  root.setAttribute("data-theme", theme);
  // if you also switch logos elsewhere by data-theme, this is enough
}

type ThemeState = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
  init: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",

  setTheme: (t) => {
    localStorage.setItem(LS_KEY, t);
    applyTheme(t);
    set({ theme: t });
  },

  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },

  init: () => {
    const saved = (localStorage.getItem(LS_KEY) as Theme | null) ?? systemTheme();
    applyTheme(saved);
    set({ theme: saved });
  },
}));

// helper for components that want a simple hook
export const useTheme = () => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggle = useThemeStore((s) => s.toggle);
  const init = useThemeStore((s) => s.init);
  return { theme, setTheme, toggle, init };
};
