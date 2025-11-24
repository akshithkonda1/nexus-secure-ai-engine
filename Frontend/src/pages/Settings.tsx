import { SlideUp } from "@/components/animations/SlideUp";
import { useTheme, type ThemeMode } from "@/theme/useTheme";

export default function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const modes: ThemeMode[] = ["light", "dark", "system"];

  return (
    <div className="space-y-6">
      <SlideUp className="rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Settings</p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">System preferences</h1>
        <p className="text-sm text-[var(--text-secondary)]">Choose how Ryuzen renders. Currently using {resolvedTheme}.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                theme === mode
                  ? "border-[color-mix(in_srgb,var(--accent-primary)_60%,transparent)] text-[var(--text-primary)]"
                  : "border-[var(--border-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </SlideUp>

      <SlideUp className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-4">
        <p className="text-sm text-[var(--text-secondary)]">More settings panels will appear here soon.</p>
      </SlideUp>
    </div>
  );
}
