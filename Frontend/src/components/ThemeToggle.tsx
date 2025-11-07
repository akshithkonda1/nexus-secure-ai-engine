import { useTheme } from "@/theme/useTheme";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  const label = theme === "dark" ? "Light Mode" : theme === "light" ? "System" : "Dark Mode";
  const icon = theme === "dark" ? <Sun className="h-4 w-4 text-yellow-400" /> :
               theme === "light" ? <Moon className="h-4 w-4 text-blue-500" /> :
               <Moon className="h-4 w-4 text-blue-500" />;

  return (
    <button
      onClick={() => setTheme(next)}
      className="flex items-center justify-between gap-3 w-full px-3 py-2 mt-3 text-sm rounded-lg border border-border/50 hover:border-accent hover:bg-accent/10"
      aria-label="Toggle theme"
      title={`Switch to ${label}`}
    >
      <div className="flex items-center gap-2">{icon}<span>{label}</span></div>
      <div className={`relative flex h-5 w-10 rounded-full ${theme !== "dark" ? "bg-gray-300" : "bg-blue-600"}`}>
        <span className={`absolute top-[2px] h-4 w-4 bg-white rounded-full transition-transform duration-300
          ${theme === "dark" ? "left-[22px]" : theme === "light" ? "left-[2px]" : "left-[12px]"}`}/>
      </div>
    </button>
  );
}
