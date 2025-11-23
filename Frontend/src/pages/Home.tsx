import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useUI } from "@/state/ui";
import { Skeleton } from "@/components/common/Skeleton";
import { useTheme } from "@/hooks/useTheme";
import { Sparkles, Cpu, ShieldCheck, Activity } from "lucide-react";

export default function Home() {
  const { openCommandCenter } = useUI();
  const { resolvedTheme } = useTheme();

  const heroGradient =
    resolvedTheme === "dark"
      ? "from-cyan-400/30 via-sky-500/20 to-purple-500/25"
      : "from-cyan-500/30 via-sky-500/25 to-purple-500/25";

  return (
    <div className="space-y-8">
      <motion.section
        className={`relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.35)]`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${heroGradient}`} aria-hidden="true" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--text-secondary)]">Ryuzen OS</p>
            <h1 className="text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-4xl">
              Orchestrate Toron missions with PS5-grade smoothness.
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Ryuzen fuses holographic control tiles, ambient motion, and auto theme intelligence. Stay in flow while the system adapts to you.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={openCommandCenter}
                className="button-primary rounded-xl px-5 py-3 text-sm font-semibold shadow-lg shadow-cyan-500/30 transition hover:-translate-y-[1px]"
              >
                Open Command Center
              </button>
              <button className="button-ghost rounded-xl px-4 py-3 text-sm font-semibold shadow-inner">
                View Release Notes
              </button>
            </div>
          </div>
          <div className="grid w-full max-w-md grid-cols-2 gap-3 rounded-3xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_88%,transparent)] p-4">
            <StatusTile icon={<Sparkles className="h-5 w-5" />} title="Live tasks" value="12" />
            <StatusTile icon={<Cpu className="h-5 w-5" />} title="Model blend" value="Omni · Toron" />
            <StatusTile icon={<ShieldCheck className="h-5 w-5" />} title="Guardrails" value="Active" />
            <StatusTile icon={<Activity className="h-5 w-5" />} title="Sync" value="Low latency" />
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.section
          className="glass-panel col-span-2 rounded-3xl border border-[var(--border-strong)] p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.35 } }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Live missions</p>
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Toron queue</h3>
            </div>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_18%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
              Auto-prioritized
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {["Recon web brief", "Summon holo board", "Align agents", "Publish note"].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_82%,transparent)] px-4 py-3"
              >
                <div className="flex items-center gap-3 text-[var(--text-primary)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_60%,transparent)]" />
                  <span className="font-semibold">{item}</span>
                </div>
                <span className="text-sm text-[var(--text-secondary)]">Auto</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="glass-panel rounded-3xl border border-[var(--border-strong)] p-6"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.08, duration: 0.35 } }}
        >
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Activity</p>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Live telemetry</h3>
          <div className="mt-5 space-y-3">
            <Skeleton className="h-3.5 w-[70%]" />
            <Skeleton className="h-3.5 w-[60%]" />
            <Skeleton className="h-3.5 w-[80%]" />
            <Skeleton className="h-3.5 w-[50%]" />
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function StatusTile({
  icon,
  title,
  value,
}: {
  icon: ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_82%,transparent)] px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] text-[var(--text-primary)]">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">{title}</p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}
