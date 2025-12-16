import { LucideIcon, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ActionCardProps {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  onClick?: () => void;
  description?: string;
}

export default function ActionCard({ title, icon: Icon, iconBg, onClick, description }: ActionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-5 py-4 transition-all duration-300 hover:border-[var(--line-strong)] hover:shadow-lg"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[var(--ryuzen-dodger)]/5 to-[var(--ryuzen-purple)]/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />

      <div className="relative flex items-center gap-3">
        <motion.div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} shadow-md`}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="h-6 w-6 text-white" aria-hidden />
        </motion.div>
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-[var(--text-strong)]">{title}</span>
          {description && (
            <span className="text-xs text-[var(--text-muted)]">{description}</span>
          )}
        </div>
      </div>

      <motion.div
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-surface)] transition-all duration-300 group-hover:border-[var(--accent)] group-hover:bg-gradient-to-br group-hover:from-[var(--ryuzen-dodger)]/10 group-hover:to-[var(--ryuzen-purple)]/10"
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <ArrowRight className="h-4 w-4 text-[var(--text-muted)] transition-colors duration-300 group-hover:text-[var(--accent)]" aria-hidden />
      </motion.div>
    </motion.button>
  );
}
