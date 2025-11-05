// src/stores/themeStore.ts
import { create } from "zustand";
import { applyTheme, ThemeChoice } from "@/shared/theme/domTheme";

type State = {
  theme: ThemeChoice;
  resolvedTheme: "light" | "dark";
  setTheme: (t: ThemeChoice) => void;
};

const getInitial = (): { theme: ThemeChoice; resolved: "light" | "dark" } => {
  const saved = (localStorage.getItem("theme") as ThemeChoice) || "system";
  const resolved =
    saved === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : saved;
  return { theme: saved, resolved };
};

export const useTheme = create<State>((set) => {
  const { theme, resolved } = getInitial();

  // apply immediately on first load
  applyTheme(theme);

  // keep store in sync with global event
  window.addEventListener("themechange", (e: Event) => {
    const { choice, resolved } = (e as CustomEvent).detail;
    set({ theme: choice, resolvedTheme: resolved });
  });

  return {
    theme,
    resolvedTheme: resolved,
    setTheme: (t) => {
      applyTheme(t); // will also emit "themechange"
      set({ theme: t, resolvedTheme: t === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : t
      });
    },
  };
});
