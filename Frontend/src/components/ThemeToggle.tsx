import { Sun, Moon } from "lucide-react";

import { useTheme } from "@/theme/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-pressed={isDark}
      className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-elevated/60 px-3 py-2 text-sm font-medium text-white transition hover:border-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="flex items-center gap-2">
        {isDark ? <Sun className="h-4 w-4 text-yellow-400" aria-hidden="true" /> : <Moon className="h-4 w-4 text-blue-500" aria-hidden="true" />}
        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      </span>
      <span className={`relative flex h-5 w-10 items-center rounded-full ${isDark ? "bg-blue-600" : "bg-white/20"}`}>
        <span
          className={`absolute left-[2px] top-[2px] h-4 w-4 rounded-full bg-white transition-transform ${isDark ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
    </button>
  );
}
