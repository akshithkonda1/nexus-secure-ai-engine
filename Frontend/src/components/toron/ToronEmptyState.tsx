import { motion } from "framer-motion";
import "@/styles/toron.css";

interface ToronEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ToronEmptyState({ title, description, actionLabel, onAction }: ToronEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 28 }}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border-soft)] bg-[var(--panel-elevated)]/60 px-6 py-10 text-center"
    >
      <div className="h-12 w-12 rounded-full bg-[var(--border-soft)]" />
      <div className="space-y-1">
        <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          type="button"
          className="rounded-lg bg-[var(--toron-accent)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[var(--toron-accent)]/40 transition hover:bg-[color-mix(in_srgb,var(--toron-accent)_88%,black)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--toron-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

export default ToronEmptyState;
