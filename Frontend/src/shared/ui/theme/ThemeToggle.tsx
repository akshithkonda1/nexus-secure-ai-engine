import * as React from "react";
import { useTheme } from "../../../theme/useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { effective, setPref, pref } = useTheme();
  const label = effective === "dark" ? "Light mode" : "Dark mode";

  return (
    <button
      type="button"
      onClick={() => setPref(effective === "dark" ? "light" : "dark")}
      aria-label={label}
      data-theme-choice={pref}
      className={
        "inline-flex items-center rounded-xl px-3 py-2 text-sm border " +
        "hover:bg-neutral-100 dark:hover:bg-neutral-800 " +
        (className ? ` ${className}` : "")
      }
    >
      {label}
    </button>
  );
}
export { ThemeProvider, useTheme } from "../../../theme/useTheme";
