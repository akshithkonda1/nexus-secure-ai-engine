import { useEffect, useState, useContext, createContext } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);

    // Prevent Windows forced colors from overriding the UI
    if (window.matchMedia("(forced-colors: active)").matches) {
      root.style.setProperty("forced-color-adjust", "none");
    }
  }, [theme]);

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

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
