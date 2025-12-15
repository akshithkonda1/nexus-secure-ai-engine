import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "ryuzen-theme";

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveMode(mode: ThemeMode) {
  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }
  return mode;
}

function applyTheme(mode: "light" | "dark") {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.classList.toggle("dark", mode === "dark");
}

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

  const contextValue = useMemo(
    () => ({
      mode,
      resolved,
      setMode: (next: ThemeMode) => {
        setMode(next);
        localStorage.setItem(STORAGE_KEY, next);
      },
    }),
    [mode, resolved]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider");
  return value;
}
