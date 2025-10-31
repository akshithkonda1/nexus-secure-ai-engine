import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSessionStore } from "@/shared/state/session";
import { ACCENTS_STORAGE_KEY, DEFAULT_ACCENTS, getInitialAccentMap, type AccentMap } from "@/shared/lib/colors";

type Theme = "light" | "dark";
type Mode = "student" | "business" | "nexusos";

type ThemeContextValue = {
  theme: Theme;
  mode: Mode;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  accents: AccentMap;
  setAccentForMode: (mode: Mode, hex: string) => void;
};

const THEME_KEY = "nexus.theme";
const MODE_KEY = "nexus.mode";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type ThemeProviderProps = {
  children: React.ReactNode;
};

const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }
  const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isDark ? "dark" : "light";
};

const getStoredMode = (): Mode => {
  if (typeof window === "undefined") {
    return "nexusos";
  }
  const stored = window.localStorage.getItem(MODE_KEY) as Mode | null;
  if (stored === "student" || stored === "business" || stored === "nexusos") {
    return stored;
  }
  return "nexusos";
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(getPreferredTheme);
  const [mode, setModeState] = useState<Mode>(getStoredMode);
  const [accents, setAccents] = useState<AccentMap>(() => {
    try {
      return getInitialAccentMap();
    } catch {
      return DEFAULT_ACCENTS;
    }
  });
  const setSessionTheme = useSessionStore((state) => state.setTheme);
  const setSessionMode = useSessionStore((state) => state.setMode);
  const setSessionAccent = useSessionStore((state) => state.setAccent);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_KEY, theme);
    setSessionTheme(theme);
  }, [theme, setSessionTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-mode", mode);
    window.localStorage.setItem(MODE_KEY, mode);
    setSessionMode(mode);
  }, [mode, setSessionMode]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const root = document.documentElement;
    const accent = accents[mode] ?? DEFAULT_ACCENTS[mode];
    root.style.setProperty("--accent", accent);
  }, [accents, mode]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setReduce = () => {
      document.documentElement.dataset.reduceMotion = mq.matches ? "true" : "false";
    };
    setReduce();
    mq.addEventListener("change", setReduce);
    return () => mq.removeEventListener("change", setReduce);
  }, []);

  const setAccentForMode = useCallback(
    (targetMode: Mode, hex: string) => {
      setAccents((prev) => {
        if (prev[targetMode] === hex) {
          return prev;
        }
        const next: AccentMap = { ...prev, [targetMode]: hex };
        if (typeof window !== "undefined") {
          window.localStorage.setItem(ACCENTS_STORAGE_KEY, JSON.stringify(next));
        }
        setSessionAccent(targetMode, hex);
        if (targetMode === mode && typeof document !== "undefined") {
          document.documentElement.style.setProperty("--accent", hex);
        }
        return next;
      });
    },
    [mode, setSessionAccent]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      setTheme: setThemeState,
      setMode: setModeState,
      accents,
      setAccentForMode
    }),
    [theme, mode, accents, setAccentForMode]
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
