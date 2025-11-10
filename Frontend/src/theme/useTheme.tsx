import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ThemePref = Theme;

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: "light" | "dark";
  pref: Theme;
  setPref: (theme: Theme) => void;
  effective: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";
const LEGACY_KEYS = ["nexus:theme", "nexus-theme"] as const;
const WATCH_KEYS = [STORAGE_KEY, ...LEGACY_KEYS];

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  for (const key of WATCH_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  }
  return "system";
}

function resolveTheme(theme: Theme, systemDark: boolean): "light" | "dark" {
  if (theme === "system") {
    return systemDark ? "dark" : "light";
  }
  return theme;
}

function applyTheme(theme: Theme, systemDark: boolean, withTransition: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const dark = resolveTheme(theme, systemDark) === "dark";

  if (withTransition) {
    root.classList.add("theme-transition");
    requestAnimationFrame(() => {
      root.classList.toggle("dark", dark);
      window.setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 260);
    });
    return;
  }

  root.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const hasMounted = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handle = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches);
    };
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handle);
      return () => mql.removeEventListener("change", handle);
    }
    mql.addListener(handle);
    return () => mql.removeListener(handle);
  }, []);

  useEffect(() => {
    applyTheme(theme, systemDark, hasMounted.current);
    hasMounted.current = true;
  }, [theme, systemDark]);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
        for (const key of LEGACY_KEYS) {
          window.localStorage.removeItem(key);
        }
      } catch {
        /* ignore */
      }
      applyTheme(next, systemDark, true);
    },
    [systemDark]
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (!event.key || !WATCH_KEYS.includes(event.key as (typeof WATCH_KEYS)[number])) {
        return;
      }
      const next = event.newValue as Theme | null;
      if (next && (next === "light" || next === "dark" || next === "system")) {
        setThemeState(next);
        applyTheme(next, systemDark, true);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [systemDark]);

  const value = useMemo<ThemeContextValue>(() => {
    const resolved = resolveTheme(theme, systemDark);
    return {
      theme,
      setTheme,
      resolved,
      pref: theme,
      setPref: setTheme,
      effective: resolved,
    };
  }, [theme, systemDark, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
