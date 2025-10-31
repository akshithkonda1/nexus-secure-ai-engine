import { useMemo } from "react";
import { IosSwitch } from "@/shared/ui/controls/IosSwitch";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { logEvent } from "@/shared/lib/audit";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const checked = useMemo(() => theme === "dark", [theme]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted max-sm:sr-only sm:text-sm">Dark theme</span>
      <IosSwitch
        checked={checked}
        onCheckedChange={(value) => {
          const next = value ? "dark" : "light";
          if (next === theme) {
            return;
          }
          setTheme(next);
          logEvent("theme.change", { theme: next });
        }}
        label="Toggle dark theme"
      />
    </div>
  );
}
