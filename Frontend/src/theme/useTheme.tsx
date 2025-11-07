import { useEffect, useState, useContext, createContext } from "react";

type Ctx = { theme: "light" | "dark"; setTheme: (t: "light" | "dark") => void };
const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const initial =
    (typeof window !== "undefined" &&
      (localStorage.getItem("nexus-theme") as "light" | "dark")) || "dark";
  const [theme, setTheme] = useState<"light" | "dark">(initial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("nexus-theme", theme);

    // Guard against Windows forced-colors
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
