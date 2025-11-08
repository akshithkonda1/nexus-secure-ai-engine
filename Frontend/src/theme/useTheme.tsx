import { createContext, useContext, useEffect, useState } from "react";
type T = { theme: "dark" | "light"; setTheme: (t: "dark" | "light") => void };
const C = createContext<T | null>(null);

function getInitialTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("nexus-theme");
  return saved === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">(() => getInitialTheme());
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    try {
      window.localStorage.setItem("nexus-theme", theme);
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(forced-colors: active)").matches) {
      root.style.setProperty("forced-color-adjust", "none");
    }
  }, [theme]);
  return <C.Provider value={{ theme, setTheme }}>{children}</C.Provider>;
}
export function useTheme() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
