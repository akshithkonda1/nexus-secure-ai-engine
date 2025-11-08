import { useTheme } from "../theme/useTheme";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(next)}
      className="flex items-center justify-between gap-3 w-full px-3 py-2 mt-3 text-sm font-medium rounded-lg border border-border/50 hover:border-accent hover:bg-[color:var(--nexus-accent)]/10 transition-all"
    >
      <div className="flex items-center gap-2">
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
        <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
      </div>
      <div
        className={`relative flex h-5 w-10 rounded-full ${
          theme === "dark" ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-4 w-4 bg-white rounded-full transition-transform duration-300 ${
            theme === "dark" ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}
