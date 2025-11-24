import { SlideUp } from "@/components/animations/SlideUp";
import { useTheme } from "@/theme/useTheme";

export default function Toron() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="space-y-6">
      <SlideUp className="rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Toron</p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Mission control</h1>
        <p className="text-sm text-[var(--text-secondary)]">Toron tiles will land here. The theme is currently {resolvedTheme}.</p>
      </SlideUp>

      <div className="grid gap-4 md:grid-cols-2">
        {["Queue", "Agents"].map((item) => (
          <SlideUp
            key={item}
            className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] p-4"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Placeholder</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{item}</p>
            <p className="text-sm text-[var(--text-secondary)]">Hook up Toron data feeds when backend is ready.</p>
          </SlideUp>
        ))}
      </div>
    </div>
  );
}
