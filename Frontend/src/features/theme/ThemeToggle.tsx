import { MoonStar, SunMedium } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useThemeContext } from "@/shared/ui/theme/ThemeProvider";

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useThemeContext();
  const isDark = theme === "dark";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 rounded-full border border-subtle bg-[var(--app-surface)] px-3 py-1" role="group" aria-label="Toggle theme">
            <SunMedium className={"h-4 w-4" + (isDark ? " opacity-40" : " text-amber-500")} />
            <Switch checked={isDark} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} aria-label="Toggle theme" />
            <MoonStar className={"h-4 w-4" + (!isDark ? " opacity-40" : " text-indigo-400")} />
          </div>
        </TooltipTrigger>
        <TooltipContent>{isDark ? "Dark mode engaged" : "Light mode engaged"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
