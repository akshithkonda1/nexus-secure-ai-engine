"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // FIXED: remove TypeScript syntax
  const current = resolvedTheme ?? theme ?? "light";
  const nextTheme = current === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      aria-label="Toggle Theme"
      className="
        w-10 h-10 flex items-center justify-center
        rounded-full backdrop-blur-xl transition-all duration-200
        hover:scale-105 active:scale-95
        bg-black/5 border border-black/10 text-black/80
        dark:bg-white/10 dark:border-white/10 dark:text-white/80
      "
    >
      {current === "dark" ? (
        <Sun size={18} strokeWidth={2} />
      ) : (
        <Moon size={18} strokeWidth={2} />
      )}
    </button>
  );
}
