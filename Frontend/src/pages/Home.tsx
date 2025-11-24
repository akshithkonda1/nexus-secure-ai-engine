import { SlideUp } from "@/components/animations/SlideUp";
import { motion } from "framer-motion";
import { useUI } from "@/state/ui";
import { useTheme } from "@/theme/useTheme";

export default function Home() {
  const { openCommandCenter } = useUI();
  const { resolvedTheme } = useTheme();

  const heroGradient =
    resolvedTheme === "dark"
      ? "from-cyan-400/25 via-purple-500/25 to-emerald-400/20"
      : "from-emerald-500/30 via-purple-500/20 to-cyan-400/20";

  const tiles = [
    "Neural Load",
    "Pipelines",
    "Workspace",
    "Documents",
    "Telemetry",
    "History",
  ];

  return (
    <div className="space-y-10">
      {/* ─────────────────────────────────────────────
        HERO CARD
      ───────────────────────────────────────────── */}
      <SlideUp className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-10 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${heroGradient} pointer-events-none`}
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative flex flex-col gap-4"
        >
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">
            Ryuzen OS V2
          </p>

          <h1 className="text-4xl font-semibold text-[var(--text-primary)] leading-tight drop-shadow-[0_4px_14px_rgba(0,0,0,0.4)]">
            Welcome to the Ryuzen Control Surface
          </h1>

          <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
            The future of AI operations—unified into one cockpit. Toron, Workspace,
            Connectors, and Telemetry all run here with adaptive PS5-style dynamic
            UI motion.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow: "0 12px 40px rgba(52,224,161,0.35)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={openCommandCenter}
              className="relative flex items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent-secondary)_35%,transparent)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-[0_12px_40px_rgba(124,93,255,0.3)] backdrop-blur-md"
            >
              Launch Command Center
              <span
                className="absolute inset-0 -z-10 rounded-2xl bg-[color-mix(in_srgb,var(--accent-primary)_28%,transparent)] blur-xl"
                aria-hidden
              />
            </motion.button>

            <span className="rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_75%,transparent)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] backdrop-blur-sm">
              Theme synced to {resolvedTheme}
            </span>
          </div>
        </motion.div>
      </SlideUp>

      {/* ─────────────────────────────────────────────
        GRID: RYUZEN STUB MODULES
      ───────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {tiles.map((title, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              ease: "easeOut",
              delay: 0.05 * index,
            }}
          >
            <SlideUp
              className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-6 shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 via-transparent to-[var(--accent-secondary)]/10 pointer-events-none"
                aria-hidden
              />
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                Ryuzen Stub
              </p>
              <p className="text-xl font-semibold text-[var(--text-primary)]">
                {title}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Live system telemetry will populate this block soon.
              </p>
            </SlideUp>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
