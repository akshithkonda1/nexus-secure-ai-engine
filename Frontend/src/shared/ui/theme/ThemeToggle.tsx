import * as React from "react";
import { useTheme } from "../../../theme/useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolved, setTheme } = useTheme();
  const label = resolved === "dark" ? "Light mode" : "Dark mode";
  const nextTheme = resolved === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={label}
      data-theme-choice={resolved}
      className={
        "inline-flex items-center rounded-xl px-3 py-2 text-sm border transition " +
        "hover:bg-[rgb(var(--panel))] " +
        (className ? ` ${className}` : "")
      }
    >
      {label}
    </button>
  );
}
export { ThemeProvider, useTheme } from "../../../theme/useTheme";
