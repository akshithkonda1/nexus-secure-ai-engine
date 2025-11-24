import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "ryuzen-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const resolveTheme = (mode: ThemeMode): "light" | "dark" => {
  return mode === "system" ? getSystemTheme() : mode;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(getSystemTheme());
  const transitionTimer = useRef<number>();

  const applyTheme = useCallback(
    (mode: ThemeMode, resolved: "light" | "dark") => {
      if (typeof document === "undefined") return;
      const root = document.documentElement;
      root.dataset.theme = resolved;
      root.classList.add("theme-fade");

      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
      transitionTimer.current = window.setTimeout(() => {
        root.classList.remove("theme-fade");
      }, 320);
    },
    [],
  );

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
    const initial = stored ?? "system";
    const resolved = resolveTheme(initial);
    setThemeState(initial);
    setResolvedTheme(resolved);
    applyTheme(initial, resolved);
  }, [applyTheme]);

  useEffect(() => {
    if (theme !== "system") {
      const resolved = resolveTheme(theme);
      setResolvedTheme(resolved);
      applyTheme(theme, resolved);
      return;
    }

    const handleMediaChange = () => {
      const next = resolveTheme("system");
      setResolvedTheme(next);
      applyTheme("system", next);
    };

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", handleMediaChange);
    handleMediaChange();
    return () => media.removeEventListener("change", handleMediaChange);
  }, [theme, applyTheme]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setThemeState(next);
      const resolved = resolveTheme(next);
      setResolvedTheme(resolved);
      applyTheme(next, resolved);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (error) {
        console.warn("Failed to persist theme", error);
      }
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      if (current === "light") return "dark";
      if (current === "dark") return "light";
      return getSystemTheme() === "dark" ? "light" : "dark";
    });
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export const useTheme = useThemeContext;
