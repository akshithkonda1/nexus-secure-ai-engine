import { Moon, Sun } from "lucide-react";
import { useMemo } from "react";

import { useTheme } from "@/theme/useTheme";

const trackClasses =
  "relative flex h-7 w-12 items-center justify-between rounded-full bg-surface/80 px-1 transition-colors duration-300 ease-out";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const thumbClassName = useMemo(() => {
    const base =
      "pointer-events-none absolute h-5 w-5 rounded-full bg-accent text-accent-foreground shadow-soft transition-transform duration-300 ease-out";
    return isDark ? `${base} translate-x-0` : `${base} translate-x-5`;
  }, [isDark]);

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isDark}
      className="group flex w-full flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-3 py-3 text-xs font-semibold text-foreground shadow-soft transition hover:border-accent/70 hover:text-accent-foreground hover:shadow-glow focus-visible:outline-none"
    >
      <span className={`${trackClasses} group-hover:bg-surface/90`}>
        <Sun
          className={`pointer-events-none h-3.5 w-3.5 text-muted transition-opacity duration-300 ${
            isDark ? "opacity-0" : "opacity-100"
          }`}
        />
        <Moon
          className={`pointer-events-none h-3.5 w-3.5 text-muted transition-opacity duration-300 ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
        />
        <span className={thumbClassName} />
      </span>
      <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
};

export default ThemeToggle;
