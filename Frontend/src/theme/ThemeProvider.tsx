import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import "./RyuzenTokens.css";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "ryuzen-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const resolveTheme = (mode: ThemeMode): ResolvedTheme => (mode === "system" ? getSystemTheme() : mode);

const syncDocumentTheme = (mode: ThemeMode, resolved: ResolvedTheme) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.add("ryuzen-theme");
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
  root.dataset.userTheme = mode;
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
    return stored;
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const initial = typeof window === "undefined" ? "system" : ((localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system");
    return resolveTheme(initial);
  });

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    syncDocumentTheme(mode, resolved);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch (error) {
        console.warn("Unable to persist theme preference", error);
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  useEffect(() => {
    syncDocumentTheme(theme, resolvedTheme);
  }, [theme, resolvedTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const nextResolved = resolveTheme("system");
      setResolvedTheme(nextResolved);
      syncDocumentTheme("system", nextResolved);
    };

    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { useTheme } from "./useTheme";
