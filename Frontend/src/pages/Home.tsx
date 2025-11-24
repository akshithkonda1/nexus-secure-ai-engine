import { SlideUp } from "@/components/animations/SlideUp";
import { motion } from "framer-motion";
import { useUI } from "@/state/ui";
import { useTheme } from "@/theme/useTheme";

export default function Home() {
  const { openCommandCenter } = useUI();
  const { resolvedTheme } = useTheme();

  const heroGradient =
    resolvedTheme === "dark"
      ? "from-cyan-400/20 via-purple-500/20 to-emerald-400/10"
      : "from-emerald-500/25 via-purple-500/20 to-cyan-400/20";

  const tiles = [
    "Neural Load",
    "Pipelines",
    "Workspace",
    "Documents",
    "Telemetry",
    "History",
  ];

  return (
    <div className="space-y-14 pb-20">
      {/* ─────────────────────────────────────────────
          HERO CARD — PREMIUM VERSION
      ───────────────────────────────────────────── */}
      <SlideUp className="relative overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_96%,transparent)] p-10 shadow-[0_20px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${heroGradient} opacity-90 pointer-events-none`}
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative flex flex-col gap-5"
        >
          {/* Header Text */}
          <p className="text-xs uppercase tracking-[0.30em] text-[var(--text-secondary)] drop-shadow">
            Ryuzen OS v2 – System Overview
          </p>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-semibold text-[var(--text-primary)] leading-tight drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
            Your Central AI Control Surface
          </h1>

          <p className="max-w-3xl text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            Manage Toron, Workspace, Telemetry, and System Connectors from a
            unified cockpit. Adaptive PS5-style motion and Ryuzen intelligence
            provide a seamless operational experience.
          </p>

          {/* Buttons + Theme Badge */}
          <div className="flex flex-wrap gap-4 pt-3">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 14px 50px rgba(52,224,161,0.40)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={openCommandCenter}
              className="relative flex items-center gap-2 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent-secondary)_40%,transparent)] 
                         px-6 py-3 text-sm md:text-base font-semibold text-[var(--text-primary)] 
                         shadow-[0_12px_40px_rgba(124,93,255,0.25)] backdrop-blur-lg transition-all"
            >
              Open Command Center
              <span
                className="absolute inset-0 -z-10 rounded-2xl bg-[color-mix(in_srgb,var(--accent-primary)_32%,transparent)] blur-xl opacity-70"
                aria-hidden
              />
            </motion.button>

            <span className="rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_78%,transparent)] px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] backdrop-blur-md">
              Theme: <span className="capitalize">{resolvedTheme}</span>
            </span>
          </div>
        </motion.div>
      </SlideUp>

      {/* ─────────────────────────────────────────────
          GRID: SYSTEM MODULES (Production Style)
      ───────────────────────────────────────────── */}
      <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {tiles.map((title, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.42,
              ease: "easeOut",
              delay: 0.08 * index,
            }}
          >
            <SlideUp
              className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] 
                         bg-[color-mix(in_srgb,var(--panel-elevated)_94%,transparent)] 
                         p-6 shadow-[0_18px_45px_rgba(0,0,0,0.26)] backdrop-blur-xl transition-all"
            >
              <div
                className="absolute inset-0 bg-gradient-to-br 
                           from-[var(--accent-primary)]/6 
                           via-transparent 
                           to-[var(--accent-secondary)]/12 
                           pointer-events-none opacity-80"
                aria-hidden
              />

              <p className="text-xs uppercase tracking-[0.25em] text-[var(--text-secondary)] pb-1">
                Module
              </p>

              <p className="text-xl font-semibold text-[var(--text-primary)] tracking-tight pb-1">
                {title}
              </p>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Live telemetry and operational state will appear here soon.
              </p>
            </SlideUp>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
