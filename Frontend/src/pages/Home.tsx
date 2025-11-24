import { SlideUp } from "@/components/animations/SlideUp";
import { useUI } from "@/state/ui";
import { useTheme } from "@/theme/useTheme";

export default function Home() {
  const { openCommandCenter } = useUI();
  const { resolvedTheme } = useTheme();
  const heroGradient =
    resolvedTheme === "dark"
      ? "from-cyan-400/25 via-purple-500/25 to-emerald-400/20"
      : "from-emerald-500/30 via-purple-500/20 to-cyan-400/20";

  return (
    <div className="space-y-6">
      <SlideUp className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className={`absolute inset-0 bg-gradient-to-br ${heroGradient}`} aria-hidden />
        <div className="relative flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Ryuzen OS</p>
          <h1 className="text-3xl font-semibold text-[var(--text-primary)]">Welcome to the V2 control surface</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Drive Toron, Workspace, and telemetry from a single, PS5-inspired cockpit. Command Center floats above everything so
            you stay in flow.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={openCommandCenter}
              className="rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent-secondary)_35%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-[0_12px_40px_rgba(124,93,255,0.3)]"
            >
              Launch Command Center
            </button>
            <span className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_75%,transparent)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]">
              Theme synced to {resolvedTheme}
            </span>
          </div>
        </div>
      </SlideUp>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {["Neural Load", "Pipelines", "Workspace", "Documents", "Telemetry", "History"].map((title) => (
          <SlideUp
            key={title}
            className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">Ryuzen Stub</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{title}</p>
            <p className="text-sm text-[var(--text-secondary)]">This area will hydrate with live data soon.</p>
          </SlideUp>
        ))}
      </div>
    </div>
  );
}
