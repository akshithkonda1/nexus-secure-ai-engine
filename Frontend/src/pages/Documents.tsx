import { SlideUp } from "@/components/animations/SlideUp";
import { useTheme } from "@/theme/useTheme";

export default function Documents() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="space-y-6">
      <SlideUp className="rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Documents</p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Intelligence cache</h1>
        <p className="text-sm text-[var(--text-secondary)]">Attach your files once backend sync is ready. Theme: {resolvedTheme}.</p>
      </SlideUp>

      <SlideUp className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-4">
        <p className="text-sm text-[var(--text-secondary)]">Document grid placeholder.</p>
      </SlideUp>
    </div>
  );
}
