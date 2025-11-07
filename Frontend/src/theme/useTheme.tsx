import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemePref = "light" | "dark" | "system";
type Theme = "light" | "dark";

interface ThemeContextValue {
  pref: ThemePref;
  setPref: (pref: ThemePref) => void;
  effective: Theme;
}

const STORAGE_KEY = "theme-pref";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const isTheme = (value: string | null): value is ThemePref =>
  value === "light" || value === "dark" || value === "system";

const getSystemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getInitialPref = (): ThemePref => {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : "dark";
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(getInitialPref);
  const [systemTheme, setSystemTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? "dark" : getSystemTheme(),
  );

  const effective = useMemo<Theme>(
    () => (pref === "system" ? systemTheme : pref),
    [pref, systemTheme],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    // sync immediately in case the initial state was stale
    setSystemTheme(media.matches ? "dark" : "light");

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(effective);
    root.dataset.theme = pref;

    const forcedColors = window.matchMedia("(forced-colors: active)");
    if (forcedColors.matches) {
      root.style.setProperty("forced-color-adjust", "none");
    } else {
      root.style.removeProperty("forced-color-adjust");
    }
  }, [effective, pref]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, pref);
  }, [pref]);

  const setPref = (next: ThemePref) => {
    setPrefState(next);
  };

  return (
    <ThemeContext.Provider value={{ pref, setPref, effective }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
