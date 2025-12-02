import { Sun, Moon } from "lucide-react";
import { useRyuzenTheme } from "../../theme/RyuzenThemeProvider";

export default function ThemeToggle() {
  const { theme, setTheme } = useRyuzenTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      aria-label="Toggle Theme"
      className="
        w-10 h-10 flex items-center justify-center rounded-full
        backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95
        bg-[var(--btn-bg)] border border-[var(--btn-border)] text-[var(--btn-text)]
      "
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
