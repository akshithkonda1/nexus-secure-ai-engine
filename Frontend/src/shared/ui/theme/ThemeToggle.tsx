import * as React from "react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { applied, setTheme, theme } = useTheme();
  const label = applied === "dark" ? "Light mode" : "Dark mode";

  return (
    <button
      type="button"
      onClick={() => setTheme(applied === "dark" ? "light" : "dark")}
      aria-label={label}
      data-theme-choice={theme}
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
