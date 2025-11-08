import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemePref = "dark" | "light";
type ThemeContextValue = {
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
  pref: ThemePref;
  setPref: (t: ThemePref) => void;
  effective: ThemePref;
};
const C = createContext<ThemeContextValue | null>(null);

export const THEME_STORAGE_KEY = "nexus:theme";
const LEGACY_KEY = "nexus-theme";

function getInitialTheme(): ThemePref {
  if (typeof window === "undefined") return "dark";
  const saved =
    window.localStorage.getItem(THEME_STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY);
  return saved === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemePref>(() => getInitialTheme());
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(forced-colors: active)").matches) {
      root.style.setProperty("forced-color-adjust", "none");
    }
  }, [theme]);
  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      pref: theme,
      setPref: setTheme,
      effective: theme,
    }),
    [theme]
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}
export function useTheme() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
