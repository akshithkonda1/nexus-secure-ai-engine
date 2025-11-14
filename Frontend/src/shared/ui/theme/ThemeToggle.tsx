"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useTheme, ThemeProvider } from "./ThemeProvider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      data-theme-choice={theme}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(var(--border),0.7)] bg-[rgb(var(--panel))] text-[rgb(var(--subtle))] shadow-sm transition hover:text-[rgb(var(--text))]",
        className,
      )}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}

export { ThemeProvider, useTheme };
