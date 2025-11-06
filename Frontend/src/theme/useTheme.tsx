import * as React from "react";

export type ThemePref = "light" | "dark" | "system";
type Ctx = { pref: ThemePref; setPref: (t: ThemePref) => void };
const ThemeCtx = React.createContext<Ctx | null>(null);

function applyTheme(choice: ThemePref) {
  try {
    localStorage.setItem("theme", choice);
  } catch {
    // TODO: persist theme preference when storage is available
  }
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = choice === "dark" || (choice === "system" && prefersDark);
  const el = document.documentElement;
  el.classList.toggle("dark", isDark);
  el.dataset.theme = isDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, set] = React.useState<ThemePref>(() => {
    try {
      return (localStorage.getItem("theme") as ThemePref) || "system";
    } catch {
      // TODO: persist theme preference when storage is available
      return "system";
    }
  });

  React.useEffect(() => applyTheme(pref), [pref]);

  React.useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      try {
        const stored = (localStorage.getItem("theme") as ThemePref) || "system";
        if (stored === "system") applyTheme("system");
      } catch {
        // TODO: persist theme preference when storage is available
      }
    };
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => { mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange); };
  }, []);

  const setPref = React.useCallback((t: ThemePref) => set(t), []);
  return <ThemeCtx.Provider value={{ pref, setPref }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
