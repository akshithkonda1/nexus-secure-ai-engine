import { useMemo } from "react";
import { motion } from "framer-motion";

import { useTheme } from "@/theme/useTheme";

export function AuroraToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const gradient = useMemo(
    () =>
      isDark
        ? "bg-[linear-gradient(120deg,rgba(38,148,228,0.45),rgba(118,90,255,0.8),rgba(72,217,168,0.55))]"
        : "bg-[linear-gradient(120deg,rgba(118,90,255,0.32),rgba(72,217,168,0.48),rgba(38,148,228,0.4))]",
    [isDark],
  );

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative flex items-center gap-3 rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)] px-2 py-1 text-left text-[var(--text-secondary)] shadow-inner shadow-black/30 transition hover:-translate-y-[1px]"
      aria-label="Toggle light and dark mode"
    >
      <div className="relative h-10 w-16 rounded-full bg-[color-mix(in_srgb,var(--panel-strong)_70%,transparent)] shadow-inner shadow-black/40">
        <div className={`absolute inset-0 ${gradient} opacity-70 blur-xl`} aria-hidden />
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 340, damping: 26 }}
          className="absolute inset-0 m-1 rounded-full bg-[color-mix(in_srgb,var(--panel-elevated)_70%,transparent)] shadow-[0_10px_40px_rgba(0,0,0,0.32)]"
        />
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className={`absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-[color-mix(in_srgb,var(--accent-secondary)_35%,var(--border-strong))] bg-[color-mix(in_srgb,var(--panel-elevated)_98%,transparent)] shadow-[0_10px_30px_rgba(0,0,0,0.24)] ${
            isDark ? "right-1" : "left-1"
          }`}
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.75),transparent_55%)] opacity-70" />
          <motion.span
            initial={false}
            animate={{ opacity: isDark ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_70%_30%,rgba(108,232,255,0.6),transparent_55%)] blur-[10px]"
            aria-hidden
          />
        </motion.div>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">Theme</span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">{isDark ? "Dark" : "Light"} mode</span>
      </div>
    </button>
  );
}

export default AuroraToggle;
