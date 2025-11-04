import { useMemo } from "react";
import { useTheme } from "@/stores/themeStore";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const themeChoice = useTheme((state) => state.theme);
  const resolvedTheme = useTheme((state) => state.resolvedTheme);
  const setTheme = useTheme((state) => state.setTheme);

  const label = useMemo(() => {
    const applied = resolvedTheme;
    return applied === "dark" ? "Light mode" : "Dark mode";
  }, [resolvedTheme]);

  const handleToggle = () => {
    const applied = resolvedTheme;
    setTheme(applied === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className={
        "inline-flex items-center rounded-xl px-3 py-2 text-sm border hover:bg-neutral-100 dark:hover:bg-neutral-800" +
        (className ? ` ${className}` : "")
      }
      aria-label={label}
      data-theme-choice={themeChoice}
      onClick={handleToggle}
    >
      {label}
    </button>
  );
}
