import { useTheme } from "@/theme/useTheme";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-between gap-3 w-full px-3 py-2 text-sm rounded-lg border transition-all"
      style={{ borderColor: "var(--nexus-border)" }}
      aria-label="Toggle color theme"
    >
      <div className="flex items-center gap-2">
        {theme === "dark" ? (
          <Sun className="h-4 w-4 text-yellow-400" />
        ) : (
          <Moon className="h-4 w-4 text-blue-500" />
        )}
        <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
      </div>
      <div
        className={`relative flex h-5 w-10 rounded-full ${
          theme === "dark" ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-4 w-4 bg-white rounded-full transition-transform ${
            theme === "dark" ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}
