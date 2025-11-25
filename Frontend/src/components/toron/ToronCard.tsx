import { type PropsWithChildren } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import "@/styles/toron.css";

interface ToronCardProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function ToronCard({ title, subtitle, actions, className = "", children }: ToronCardProps) {
  const { resolvedTheme } = useTheme();

  const accent = resolvedTheme === "dark" ? "var(--toron-accent-dark)" : "var(--toron-accent-light)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      whileHover={{ scale: 1.01 }}
      className={`toron-card relative isolate overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-card)]/90 shadow-xl shadow-black/15 backdrop-blur-xl ${className}`}
      style={{
        ["--toron-card-accent" as string]: accent,
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-60 toron-gradient-overlay" aria-hidden />
      <div className="absolute inset-px rounded-[inherit] border border-white/5 mix-blend-overlay" aria-hidden />
      <div className="relative z-10 flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="space-y-1">
          {title && <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>}
          {subtitle && <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">{actions}</div>}
      </div>
      {children && <div className="relative z-10 px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>}
    </motion.div>
  );
}

export default ToronCard;
