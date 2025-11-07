import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/theme/useTheme";

export function ThemeToggle() {
  const { effective, setPref, pref } = useTheme();
  const nextMode = effective === "dark" ? "light" : "dark";

  return (
    <button
      onClick={() => setPref(nextMode)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-white/10 bg-surface/70 px-3 py-2 text-sm font-medium text-white transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="flex items-center gap-2">
        {effective === "dark" ? (
          <Sun className="h-4 w-4 text-yellow-400" />
        ) : (
          <Moon className="h-4 w-4 text-blue-500" />
        )}
        <span>{effective === "dark" ? "Light Mode" : "Dark Mode"}</span>
      </span>
      <span
        className={`relative flex h-5 w-10 rounded-full ${effective === "dark" ? "bg-blue-600" : "bg-gray-300"}`}
        data-pref={pref}
      >
        <span
          className={`absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white transition-transform ${
            effective === "dark" ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
