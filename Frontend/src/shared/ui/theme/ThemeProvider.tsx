import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useSessionStore, type NexusMode, type NexusTheme } from "@/shared/state/session";
import { modeThemes } from "./themes";

export interface ThemeContextValue {
  mode: NexusMode;
  theme: NexusTheme;
  setMode: (mode: NexusMode) => void;
  setTheme: (theme: NexusTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const { mode, theme, setMode, setTheme } = useSessionStore();
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const html = document.documentElement;
    html.dataset.theme = theme;
    html.dataset.mode = mode;
  }, [mode, theme]);

  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === "nexus.theme" && (event.newValue === "light" || event.newValue === "dark")) {
        setTheme(event.newValue);
      }
      if (
        event.key === "nexus.mode" &&
        (event.newValue === "student" || event.newValue === "business" || event.newValue === "nexusos")
      ) {
        setMode(event.newValue);
      }
    };

    window.addEventListener("storage", listener);
    return () => {
      window.removeEventListener("storage", listener);
    };
  }, [setMode, setTheme]);

  const value = useMemo(() => ({ mode, theme, setMode, setTheme }), [mode, theme, setMode, setTheme]);

  return <ThemeContext.Provider value={value}>{isHydrated ? children : null}</ThemeContext.Provider>;
}

export function getModeTheme(mode: NexusMode) {
  return modeThemes[mode];
}
