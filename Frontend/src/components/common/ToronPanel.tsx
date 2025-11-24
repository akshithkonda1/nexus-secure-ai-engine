import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ToronPanelProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function ToronPanel({ title, subtitle, children }: ToronPanelProps) {
  const constraints = { top: -40, bottom: 40, left: -40, right: 40 };

  return (
    <motion.div
      drag
      dragConstraints={constraints}
      dragElastic={0.16}
      dragMomentum={false}
      whileTap={{ cursor: "grabbing" }}
      className="holo-ring relative w-full cursor-grab overflow-hidden rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      whileHover={{ y: -2, transition: { duration: 0.2, ease: "easeOut" } }}
    >
      <div className="toron-drag-handle mb-3 flex items-center justify-between text-[var(--text-secondary)]">
        <span className="text-xs uppercase tracking-[0.28em]">Toron Tile</span>
        <span className="h-2 w-12 rounded-full bg-[color-mix(in_srgb,var(--accent-primary)_45%,transparent)]" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        {subtitle && <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>}
        {children && <div className="pt-2 text-[var(--text-primary)]">{children}</div>}
      </div>
    </motion.div>
  );
}
