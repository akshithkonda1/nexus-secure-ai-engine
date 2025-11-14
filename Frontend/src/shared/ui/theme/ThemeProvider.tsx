"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("zora-theme") as
        | Theme
        | null;
      const prefersDark =
        window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;

      const initial: Theme = stored ?? (prefersDark ? "dark" : "light");
      setThemeState(initial);
      document.documentElement.dataset.theme = initial;
    } catch {
      // Fail-soft: default to light
      document.documentElement.dataset.theme = "light";
    }
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem("zora-theme", next);
    } catch {
      // ignore storage failures
    }
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
