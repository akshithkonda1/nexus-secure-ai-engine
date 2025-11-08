import { useTheme } from "@/theme/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      onClick={() => setTheme(next)}
      className="w-full flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
      title="Toggle theme"
    >
      <span>Theme</span>
      <span className="text-xs opacity-80">{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}
