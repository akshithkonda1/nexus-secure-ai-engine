"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const baseClasses =
  "flex items-center gap-2 rounded-[32px] border border-black/10 bg-black/5 px-3 py-2 text-sm font-medium text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-xl transition hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = (resolvedTheme ?? theme ?? "light") as "light" | "dark";
  const nextTheme = current === "dark" ? "light" : "dark";

  if (!mounted) return null;

  return (
    <button className={baseClasses} onClick={() => setTheme(nextTheme)} aria-label="Toggle theme">
      {current === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="text-xs uppercase tracking-[0.2em]">{nextTheme}</span>
    </button>
  );
}
