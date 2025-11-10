import { MoonStar, SunMedium } from "lucide-react";
import * as React from "react";

import { cn } from "@/shared/lib/cn";
import { ThemeProvider, useTheme } from "../../../theme/useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolved, setTheme } = useTheme();
  const isDark = resolved === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      data-theme-choice={resolved}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border border-[rgba(var(--border),0.7)] bg-white/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--subtle))] transition",
        "hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--brand),0.3)]",
        className,
      )}
    >
      {isDark ? <MoonStar className="size-4" /> : <SunMedium className="size-4" />}
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

export { ThemeProvider, useTheme };
