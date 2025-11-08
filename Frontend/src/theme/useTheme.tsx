import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (nextTheme: ThemeMode) => void;
};

const STORAGE_KEY = "nexus-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    return "dark";
  });

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const opposite = theme === "dark" ? "light" : "dark";
    root.classList.remove(opposite);
    root.classList.add(theme);
    root.style.setProperty("color-scheme", theme);

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* no-op */
    }

    if (typeof window.matchMedia === "function") {
      const media = window.matchMedia("(forced-colors: active)");
      const applyForcedColorAdjust = () => {
        if (media.matches) {
          root.style.setProperty("forced-color-adjust", "none");
        } else {
          root.style.removeProperty("forced-color-adjust");
        }
      };

      applyForcedColorAdjust();
      media.addEventListener("change", applyForcedColorAdjust);
      return () => media.removeEventListener("change", applyForcedColorAdjust);
    }

    return undefined;
  }, [theme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme === "light" ? "light" : "dark");
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
