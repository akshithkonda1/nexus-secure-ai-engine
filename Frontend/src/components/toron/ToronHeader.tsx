import { motion } from "framer-motion";
import { useMemo } from "react";

import { RyuzenBrandmark } from "@/components/RyuzenBrandmark";
import { useTheme } from "@/theme/useTheme";

type ToronHeaderProps = {
  onOpenProjects?: () => void;
  onNewChat?: () => void;
};

const pulseTransition = { duration: 2.8, repeat: Infinity, ease: "easeInOut" };

export function ToronHeader({ onOpenProjects, onNewChat }: ToronHeaderProps) {
  const { resolvedTheme, setTheme, theme } = useTheme();

  const glassBackground = useMemo(
    () =>
      resolvedTheme === "dark"
        ? "var(--toron-glass-dark)"
        : "var(--toron-glass-light)",
    [resolvedTheme],
  );

  const glowBorder = useMemo(
    () =>
      resolvedTheme === "dark"
        ? "0 0 0 1px rgba(255,255,255,0.08), 0 25px 80px rgba(0,0,0,0.45)"
        : "0 0 0 1px rgba(255,255,255,0.28), 0 20px 70px rgba(15,23,42,0.15)",
    [resolvedTheme],
  );

  const themeOptions = [
    { key: "light" as const, label: "Light" },
    { key: "dark" as const, label: "Dark" },
    { key: "system" as const, label: "System" },
  ];

  return (
    <motion.header
      className="relative z-20 mx-auto mt-4 w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.18)] dark:border-white/10"
      style={{
        background: glassBackground,
        backdropFilter: "blur(18px) saturate(150%)",
        WebkitBackdropFilter: "blur(18px) saturate(150%)",
        boxShadow: glowBorder,
      }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,225,255,0.18),transparent_42%),radial-gradient(circle_at_80%_15%,rgba(154,77,255,0.16),transparent_45%),radial-gradient(circle_at_60%_70%,rgba(0,225,255,0.08),transparent_50%)]" />
      <motion.div
        className="pointer-events-none absolute inset-[1px] rounded-[26px]"
        animate={{ opacity: [0.5, 0.9, 0.6] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))" }}
      />

      <div className="relative flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.06, 1] }}
            transition={pulseTransition}
          >
            <div className="absolute inset-[-18px] rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,225,255,0.24),transparent_45%)] blur-2xl" />
            <RyuzenBrandmark size={44} className="relative drop-shadow-[0_10px_25px_rgba(0,0,0,0.2)]" />
          </motion.div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.32em] text-[color-mix(in_srgb,var(--text-secondary),transparent_0%)]">
              Neural Ops
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Toron</h1>
              <motion.span
                className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-emerald-500 ring-1 ring-emerald-400/50 shadow-[0_10px_30px_rgba(16,185,129,0.2)] dark:text-emerald-300"
                animate={{ scale: [1, 1.04, 1] }}
                transition={pulseTransition}
                style={{ background: "rgba(16,185,129,0.12)" }}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.18)]" />
                Neural Core Active
              </motion.span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-full border border-white/30 bg-white/70 p-1 text-xs shadow-inner backdrop-blur-md dark:border-white/10 dark:bg-white/10">
            {themeOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setTheme(option.key)}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  theme === option.key
                    ? "bg-gradient-to-r from-[var(--toron-cosmic-primary)] to-[var(--toron-cosmic-secondary)] text-white shadow-[0_12px_30px_rgba(0,225,255,0.35)]"
                    : "text-[var(--text-primary)] hover:bg-white/70 dark:hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <motion.button
            onClick={onOpenProjects}
            className="relative overflow-hidden rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-lg backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] dark:border-white/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ background: glassBackground }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[var(--toron-cosmic-primary)]/15 via-white/5 to-[var(--toron-cosmic-secondary)]/20 opacity-0 transition group-hover:opacity-100" />
            <span className="relative">Projects</span>
          </motion.button>

          <motion.button
            onClick={onNewChat}
            className="relative overflow-hidden rounded-full bg-gradient-to-r from-[var(--toron-cosmic-primary)] to-[var(--toron-cosmic-secondary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,225,255,0.35)] transition"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="relative">New Chat</span>
            <motion.span
              className="absolute inset-0"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={pulseTransition}
              style={{
                background:
                  "radial-gradient(circle at 25% 50%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 75% 50%, rgba(255,255,255,0.18), transparent 45%)",
              }}
            />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}

export default ToronHeader;
