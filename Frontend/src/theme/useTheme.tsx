import { useEffect, useState, useContext, createContext } from "react";

type Ctx = { theme: "light" | "dark" | "system"; setTheme: (t: "light" | "dark" | "system") => void };
const ThemeContext = createContext<Ctx | null>(null);

function applyTheme(theme: Ctx["theme"]) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  const choice =
    theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
  root.classList.add(choice);
  if (window.matchMedia("(forced-colors: active)").matches) {
    root.style.setProperty("forced-color-adjust", "none");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Ctx["theme"]>(
    (localStorage.getItem("nexus-theme") as Ctx["theme"]) || "dark"
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("nexus-theme", theme);
  }, [theme]);

  // keep in sync with OS when 'system'
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => theme === "system" && applyTheme("system");
    mq.addEventListener?.("change", listener);
    return () => mq.removeEventListener?.("change", listener);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
