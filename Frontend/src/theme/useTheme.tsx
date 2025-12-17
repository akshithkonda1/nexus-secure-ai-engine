import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
};

const STORAGE_KEY = "ryuzen-theme";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const resolveMode = (mode: ThemeMode) => {
  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }
  return mode;
};

const applyTheme = (mode: "light" | "dark") => {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.classList.toggle("dark", mode === "dark");
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored ?? "system";
  });

  const resolved = useMemo(() => resolveMode(mode), [mode]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => {
      if (mode === "system") {
        applyTheme(resolveMode("system"));
      }
    };

    applyTheme(resolved);
    query.addEventListener("change", syncSystem);
    return () => query.removeEventListener("change", syncSystem);
  }, [mode, resolved]);

  const setTheme = (next: ThemeMode) => {
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolved,
      setTheme,
    }),
    [mode, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
