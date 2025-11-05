// src/shared/ui/theme/ThemeToggle.tsx
import * as React from "react";
import { useTheme } from "@/stores/themeStore";

type Mode = "light" | "dark" | "system";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const themeChoice = useTheme((s) => s.theme) as Mode;             // user's selected mode
  const resolvedTheme = useTheme((s) => s.resolvedTheme) as "light" | "dark"; // actual applied
  const setThemeInStore = useTheme((s) => s.setTheme) as (m: Mode) => void;

  const apply = (next: Mode) => {
    // 1) update your store
    setThemeInStore(next);
    // 2) apply to DOM immediately (wired in index.html)
    (window as any).__setTheme?.(next);
  };

  // Keep DOM synced when OS theme flips while on "system"
  React.useEffect(() => {
    if (themeChoice !== "system" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => (window as any).__setTheme?.("system");
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [themeChoice]);

  const Btn = ({ mode, label }: { mode: Mode; label: string }) => {
    const active = themeChoice === mode;
    return (
      <button
        type="button"
        onClick={() => apply(mode)}
        aria-pressed={active}
        title={label}
        className={[
          "rounded-full px-3 py-1.5 text-sm border transition",
          active
            ? "bg-white text-black border-black/10"
            : "bg-black/5 dark:bg-white/10 text-ink/80 hover:text-ink border-black/10 dark:border-white/15",
        ].join(" ")}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      data-theme-choice={themeChoice}
      data-theme-resolved={resolvedTheme}
    >
      <Btn mode="light" label="Light" />
      <Btn mode="dark" label="Dark" />
      <Btn mode="system" label="System" />
    </div>
  );
}
