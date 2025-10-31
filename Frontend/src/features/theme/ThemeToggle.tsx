import { MoonStar, SunMedium } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { logEvent } from "@/shared/lib/audit";
import { track } from "@/shared/lib/analytics";
import { useThemeContext } from "@/shared/ui/theme/ThemeProvider";

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useThemeContext();
  const isDark = theme === "dark";
  const { push } = useToast();

  const handleChange = (checked: boolean) => {
    const nextTheme = checked ? "dark" : "light";
    setTheme(nextTheme);
    logEvent("theme:change", { to: nextTheme });
    track("theme:change", { to: nextTheme });
    push({ title: `${nextTheme === "dark" ? "Dark" : "Light"} mode on`, description: "Display palette refreshed." });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 round-card border border-subtle bg-[var(--app-surface)] px-3 py-1 shadow-ambient" role="group" aria-label="Toggle theme">
            <SunMedium className={"h-4 w-4" + (isDark ? " opacity-40" : " text-amber-500")} />
            <Switch checked={isDark} onCheckedChange={handleChange} aria-label="Toggle theme" />
            <MoonStar className={"h-4 w-4" + (!isDark ? " opacity-40" : " text-indigo-400")} />
          </div>
        </TooltipTrigger>
        <TooltipContent>{isDark ? "Dark mode engaged" : "Light mode engaged"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
