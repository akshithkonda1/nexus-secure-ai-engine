import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const label = theme === "dark" ? "Light mode" : "Dark mode";
  return (
    <button
      type="button"
      className={
        "inline-flex items-center rounded-xl px-3 py-2 text-sm border hover:bg-neutral-100 dark:hover:bg-neutral-800" +
        (className ? ` ${className}` : "")
      }
      aria-label={label}
      onClick={toggle}
    >
      {label}
    </button>
  );
}
