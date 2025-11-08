import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/theme/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(next)}
      className="w-full flex items-center justify-between border mt-2 px-3 py-2 rounded-xl hover:border-[var(--nexus-accent)] hover:bg-[var(--nexus-accent)]/10"
    >
      <div className="flex items-center gap-2">
        {theme === "dark" ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4" />}
        <span className="text-sm">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
      </div>
      <div className={`h-5 w-10 rounded-full ${theme === "dark" ? "bg-blue-600" : "bg-gray-300"} relative`}>
        <span
          className={`absolute top-[2px] h-4 w-4 bg-white rounded-full transition-transform ${
            theme === "dark" ? "translate-x-5 left-[2px]" : "translate-x-0 left-[2px]"
          }`}
        />
      </div>
    </button>
  );
}
