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
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-zora-border bg-[color:color-mix(in_srgb,var(--zora-space)_80%,transparent)] text-zora-muted shadow-zora-soft transition hover:bg-zora-deep hover:text-zora-white hover:scale-[1.01] active:scale-[0.99]",
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
