import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "ryuzen-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const resolveTheme = (theme: ThemeMode): "light" | "dark" => {
  if (theme === "system") return getSystemTheme();
  return theme;
};

const applyTheme = (theme: ThemeMode, resolved: "light" | "dark") => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = theme === "system" ? resolved : theme;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    resolveTheme("system"),
  );

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored) {
      setThemeState(stored);
      setResolvedTheme(resolveTheme(stored));
    } else {
      setResolvedTheme(resolveTheme("system"));
    }
  }, []);

  useEffect(() => {
    const handleMediaChange = () => {
      const next = resolveTheme(theme);
      setResolvedTheme(next);
      applyTheme(theme, next);
    };

    handleMediaChange();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", handleMediaChange);
    return () => media.removeEventListener("change", handleMediaChange);
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    const resolved = resolveTheme(next);
    setResolvedTheme(resolved);
    applyTheme(next, resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
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
