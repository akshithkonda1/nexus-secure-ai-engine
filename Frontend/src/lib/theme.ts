import { useEffect, useState, useCallback } from "react";

export type Theme = "light" | "dark" | "system";

function applyTheme(next: Theme) {
  const root = document.documentElement;
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = next === "dark" || (next === "system" && sysDark);

  root.classList.add("theme-transition");
  window.setTimeout(() => root.classList.remove("theme-transition"), 260);

  root.classList.toggle("dark", dark);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const t = localStorage.getItem("theme") as Theme | null;
    return t ?? "system";
  });

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem("theme", t);
    setThemeState(t);
    applyTheme(t);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const stored = (localStorage.getItem("theme") as Theme | null) ?? "system";
      if (stored === "system") applyTheme("system");
    };
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") {
        const next = (e.newValue as Theme | null) ?? "system";
        setThemeState(next);
        applyTheme(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => applyTheme(theme), []); // initial mount

  return { theme, setTheme };
}
