import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSessionStore } from "@/shared/state/session";

type Theme = "light" | "dark";
type Mode = "student" | "business" | "nexusos";

type ThemeContextValue = {
  theme: Theme;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
};

const THEME_KEY = "nexus.theme";
const MODE_KEY = "nexus.mode";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

const applyTheme = (theme: Theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
};

const applyMode = (mode: Mode) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-mode", mode);
};

const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
    return stored;
  }
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const value = isDark ? "dark" : "light";
  applyTheme(value);
  return value;
};

const getStoredMode = (): Mode => {
  if (typeof window === "undefined") {
    return "nexusos";
  }
  const stored = window.localStorage.getItem(MODE_KEY) as Mode | null;
  if (stored === "student" || stored === "business" || stored === "nexusos") {
    applyMode(stored);
    return stored;
  }
  applyMode("nexusos");
  return "nexusos";
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getPreferredTheme);
  const [mode, setModeState] = useState<Mode>(getStoredMode);
  const setSessionTheme = useSessionStore((state) => state.setTheme);
  const setSessionMode = useSessionStore((state) => state.setMode);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_KEY, theme);
    setSessionTheme(theme);
  }, [theme, setSessionTheme]);

  useEffect(() => {
    applyMode(mode);
    window.localStorage.setItem(MODE_KEY, mode);
    setSessionMode(mode);
  }, [mode, setSessionMode]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setReduce = () => {
      document.documentElement.dataset.reduceMotion = mq.matches ? "true" : "false";
    };
    setReduce();
    mq.addEventListener("change", setReduce);
    return () => mq.removeEventListener("change", setReduce);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      setTheme: setThemeState,
      setMode: setModeState
    }),
    [theme, mode]
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
