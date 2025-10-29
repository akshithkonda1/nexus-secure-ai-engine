import { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/shared/ui/switch";
import { ThemeContext } from "@/shared/ui/theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  return (
    <div className="inline-flex items-center gap-2 text-xs text-muted" role="group" aria-label="Toggle theme">
      <Sun className="h-3.5 w-3.5" aria-hidden />
      <Switch
        checked={isDark}
        onCheckedChange={(value) => setTheme(value ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <Moon className="h-3.5 w-3.5" aria-hidden />
    </div>
  );
}
