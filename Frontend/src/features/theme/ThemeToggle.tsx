import { Moon, Sun } from "lucide-react";
import { Button } from "@/shared/ui/components/button";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { useSessionStore } from "@/shared/state/session";
import { logEvent } from "@/shared/lib/audit";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const setSessionTheme = useSessionStore((state) => state.setTheme);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    logEvent("theme.change", { theme: next });
    setSessionTheme(next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      data-testid="theme-toggle"
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      onClick={toggle}
    >
      {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
