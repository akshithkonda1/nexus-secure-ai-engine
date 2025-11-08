import { useTheme } from "@/theme/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="rounded-xl border border-border/60 bg-[rgb(var(--panel))] p-2 shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div className="text-[11px] uppercase tracking-[0.2em] text-subtle mb-2">Theme</div>
      <div className="grid grid-cols-2 gap-2">
        {([
          { key: "light" as const, label: "Light" },
          { key: "dark" as const, label: "Dark" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            className={`h-8 rounded-lg border border-border/60 text-xs font-medium transition`}
            style={
              theme === key
                ? { backgroundColor: "var(--brand)", color: "#fff" }
                : { backgroundColor: "rgba(var(--surface),0.5)", color: "rgb(var(--text))" }
            }
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
