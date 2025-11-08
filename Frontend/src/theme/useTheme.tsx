import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void };

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("nexus-theme") as Theme) || "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    // keep background solid to avoid flash
    root.style.backgroundColor =
      theme === "dark" ? "var(--nexus-bg)" : "var(--nexus-bg-light)";
    localStorage.setItem("nexus-theme", theme);

    // prevent Windows forced-color hijack
    if (window.matchMedia("(forced-colors: active)").matches) {
      root.style.setProperty("forced-color-adjust", "none");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
