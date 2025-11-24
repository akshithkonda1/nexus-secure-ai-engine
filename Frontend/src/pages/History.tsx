import { SlideUp } from "@/components/animations/SlideUp";
import { useTheme } from "@/theme/useTheme";

export default function History() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="space-y-6">
      <SlideUp className="rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">History</p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Audit and trace</h1>
        <p className="text-sm text-[var(--text-secondary)]">Session timelines will render here. Theme: {resolvedTheme}.</p>
      </SlideUp>

      <SlideUp className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-4">
        <p className="text-sm text-[var(--text-secondary)]">No history yet. Start a session to populate this feed.</p>
      </SlideUp>
    </div>
  );
}
