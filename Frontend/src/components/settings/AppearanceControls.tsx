import { useTheme } from "@/shared/ui/theme/ThemeProvider";

export function AppearanceControls() {
  const { theme, setTheme } = useTheme();
  const Btn = ({ value, label }: { value: "light" | "dark"; label: string }) => (
    <button
      type="button"
      onClick={() => setTheme(value)}
      className={[
        "rounded-xl border px-3.5 py-2 text-sm transition",
        theme === value
          ? "border-[rgba(var(--brand),0.5)] bg-[rgba(var(--panel),0.75)] text-[rgb(var(--text))]"
          : "border-[rgba(var(--border),0.4)] bg-[rgba(var(--surface),0.7)] text-[rgba(var(--subtle),0.85)] hover:text-[rgb(var(--text))]"
      ].join(" ")}
      aria-pressed={theme === value}
    >
      {label}
    </button>
  );
  return (
    <div className="rounded-2xl border border-app bg-panel panel panel--glassy panel--hover p-4">
      <h3 className="mb-2 text-base font-semibold text-ink">Appearance</h3>
      <p className="mb-3 text-sm text-muted">Choose how Nexus renders. <span className="ml-2 text-ink/60">Current: {theme}</span></p>
      <div className="flex flex-wrap gap-2">
        <Btn value="light" label="Light" />
        <Btn value="dark" label="Dark" />
      </div>
    </div>
  );
}
