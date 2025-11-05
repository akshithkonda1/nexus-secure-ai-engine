// src/stores/themeStore.ts
import { create } from "zustand";
import { applyTheme, type ThemeChoice } from "../shared/ui/theme/domTheme"; // ✅ correct path

type State = {
  theme: ThemeChoice;
  resolvedTheme: "light" | "dark";
  setTheme: (t: ThemeChoice) => void;
};

const systemPrefersDark = () =>
  window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

const getInitial = (): { theme: ThemeChoice; resolved: "light" | "dark" } => {
  const saved = (localStorage.getItem("theme") as ThemeChoice) || "system";
  const resolved =
    saved === "system" ? (systemPrefersDark() ? "dark" : "light") : saved;
  return { theme: saved, resolved };
};

export const useTheme = create<State>((set) => {
  const { theme, resolved } = getInitial();

  // apply immediately on store init
  applyTheme(theme);

  // sync from DOM/theme changes (index.html boot script or other callers)
  window.addEventListener("themechange", (e: Event) => {
    const { choice, resolved } = (e as CustomEvent).detail;
    set({ theme: choice, resolvedTheme: resolved });
  });

  return {
    theme,
    resolvedTheme: resolved,
    setTheme: (t) => {
      applyTheme(t);
      const resolved =
        t === "system" ? (systemPrefersDark() ? "dark" : "light") : t;
      set({ theme: t, resolvedTheme: resolved });
    },
  };
});
