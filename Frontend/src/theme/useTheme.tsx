import { useEffect, useState, useContext, createContext, useMemo } from "react";

export type ThemePref = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: "light" | "dark";
  pref: ThemePref;
  effective: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  setPref: (pref: ThemePref) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = "nexus-theme";
const PREF_KEY = "nexus-theme-pref";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const storedPref = typeof window !== "undefined" ? (localStorage.getItem(PREF_KEY) as ThemePref | null) : null;
  const initialPref: ThemePref = storedPref ?? "dark";
  const [pref, setPref] = useState<ThemePref>(initialPref);
  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    if (initialPref === "system") {
      return getSystemTheme();
    }
    return initialPref;
  });

  const effective = useMemo(() => (pref === "system" ? getSystemTheme() : pref === "dark" ? "dark" : "light"), [pref]);

  useEffect(() => {
    if (pref === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const updateFromSystem = () => setThemeState(media.matches ? "dark" : "light");
      updateFromSystem();
      media.addEventListener("change", updateFromSystem);
      return () => media.removeEventListener("change", updateFromSystem);
    }
    setThemeState(pref === "dark" ? "dark" : "light");
    return undefined;
  }, [pref]);
  
useEffect(() => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme || 'dark');
  localStorage.setItem('nexus-theme', theme || 'dark');
  root.style.backgroundColor = theme === 'light' ? '#f9fafb' : '#0e1117';
  root.style.colorScheme = 'dark light';
  root.style.setProperty('forced-color-adjust', 'none');
}, [theme]);

 
  const setTheme = (next: "light" | "dark") => {
    setPref(next);
  };

  const value: ThemeContextValue = {
    theme,
    pref,
    effective: pref === "system" ? theme : pref,
    setTheme,
    setPref,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
