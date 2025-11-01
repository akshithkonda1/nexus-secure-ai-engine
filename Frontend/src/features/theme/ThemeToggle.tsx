import { Button } from "@/shared/ui/components/button";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className="h-8 w-8 rounded-full p-0"
      onClick={() => setTheme(next)}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </Button>
  );
}
