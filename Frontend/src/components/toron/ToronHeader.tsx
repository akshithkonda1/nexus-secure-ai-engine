import { motion } from "framer-motion";
import { useMemo } from "react";

import { RyuzenBrandmark } from "@/components/RyuzenBrandmark";
import { useTheme } from "@/theme/useTheme";

type ToronHeaderProps = {
  onOpenProjects?: () => void;
  onNewChat?: () => void;
};

const glassStyles = {
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};

export function ToronHeader({ onOpenProjects, onNewChat }: ToronHeaderProps) {
  const { resolvedTheme, setTheme, theme } = useTheme();

  const glow = useMemo(
    () =>
      resolvedTheme === "dark"
        ? "radial-gradient(circle at 20% 20%, rgba(79, 70, 229, 0.3), transparent 45%), radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.25), transparent 45%)"
        : "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.25), transparent 45%), radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.2), transparent 45%)",
    [resolvedTheme],
  );

  const themeOptions = [
    { key: "light" as const, label: "Light" },
    { key: "dark" as const, label: "Dark" },
    { key: "system" as const, label: "System" },
  ];

  return (
    <motion.header
      className="relative z-10 mx-auto mt-4 w-full max-w-6xl rounded-3xl border border-white/10 bg-white/60 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.24)] dark:border-white/5 dark:bg-white/5"
      style={{
        ...glassStyles,
        backgroundImage: glow,
        boxShadow:
          resolvedTheme === "dark"
            ? "0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04)"
            : "0 24px 80px rgba(15,23,42,0.1), 0 0 0 1px rgba(255,255,255,0.08)",
      }}
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
    >
      <motion.div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            "linear-gradient(120deg, rgba(99,102,241,0.1), rgba(56,189,248,0.1), rgba(16,185,129,0.06))",
        }}
        animate={{ opacity: [0.7, 1, 0.75] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute inset-[-1px] rounded-[26px]"
        initial={{ boxShadow: "0 0 0 rgba(99,102,241,0.45)" }}
        animate={{
          boxShadow: [
            "0 0 0 rgba(99,102,241,0.35)",
            "0 0 24px rgba(59,130,246,0.45)",
            "0 0 0 rgba(16,185,129,0.35)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ type: "spring", stiffness: 120, damping: 10, repeat: Infinity, repeatType: "mirror" }}
          >
            <div className="absolute inset-[-16px] rounded-full bg-gradient-to-br from-cyan-400/20 via-purple-500/20 to-emerald-400/16 blur-2xl" />
            <RyuzenBrandmark size={40} className="relative drop-shadow-lg" />
          </motion.div>
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--text-secondary),transparent_0%)]">
              Neural Ops
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Toron</h1>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-400/40 shadow-sm dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30">
                Neural Core Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-full border border-white/30 bg-white/70 p-1 text-xs shadow-inner dark:border-white/10 dark:bg-white/5">
            {themeOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setTheme(option.key)}
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  theme === option.key
                    ? "bg-gradient-to-r from-cyan-400/70 to-purple-500/70 text-white shadow-[0_10px_30px_rgba(59,130,246,0.35)]"
                    : "text-[var(--text-primary)] hover:bg-white/60 dark:hover:bg-white/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenProjects}
            className="group relative overflow-hidden rounded-full border border-white/40 bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] shadow-lg transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(59,130,246,0.25)] dark:border-white/10 dark:bg-white/10"
            style={glassStyles}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-500/15 to-emerald-400/20 opacity-0 transition group-hover:opacity-100" />
            <span className="relative">Projects</span>
          </button>

          <button
            onClick={onNewChat}
            className="relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(59,130,246,0.4)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_48px_rgba(99,102,241,0.55)]"
          >
            <span className="relative">New Chat</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}

export default ToronHeader;
