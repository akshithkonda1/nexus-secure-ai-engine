import { useEffect, useState, useContext, createContext, useCallback } from "react";

type Theme = "light" | "dark";
type ThemePreference = Theme | "system";

export type ThemePref = ThemePreference;

export type ThemeContextValue = {
  theme: Theme;
  pref: ThemePreference;
  effective: Theme;
  setPref: (pref: ThemePreference) => void;
  setTheme: (theme: Theme) => void;
};

const STORAGE_KEY = "theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Unable to read stored theme preference", error);
    }
  }

  const initial = typeof document !== "undefined" ? document.documentElement.dataset.theme : undefined;
  if (initial === "light" || initial === "dark") {
    return initial;
  }

  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePreference>(() => readStoredPreference());
  const [theme, setThemeState] = useState<Theme>("dark");
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return true;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const applyTheme = useCallback((next: Theme) => {
    setThemeState(next);

    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const body = document.body;
    const targets = [root, body];

    targets.forEach((node) => {
      if (!node) return;
      node.classList.remove("light", "dark");
      node.classList.add(next);
      node.setAttribute("data-theme", next);
    });

    root.style.setProperty("color-scheme", next);

    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      const forcedColors = window.matchMedia("(forced-colors: active)");
      if (forcedColors.matches) {
        targets.forEach((node) => {
          if (!node) return;
          node.style.setProperty("forced-color-adjust", "none");
        });
      } else {
        targets.forEach((node) => {
          if (!node) return;
          node.style.removeProperty("forced-color-adjust");
        });
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleChange);
    } else {
      query.addListener(handleChange);
    }

    return () => {
      if (typeof query.removeEventListener === "function") {
        query.removeEventListener("change", handleChange);
      } else {
        query.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    const resolved: Theme = pref === "system" ? (systemPrefersDark ? "dark" : "light") : pref;
    applyTheme(resolved);
  }, [pref, systemPrefersDark, applyTheme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, pref);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Unable to persist theme preference", error);
      }
    }
  }, [pref]);

  const setPref = useCallback((next: ThemePreference) => {
    setPrefState(next);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setPrefState(next);
    applyTheme(next);
  }, [applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, pref, effective: theme, setPref, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
