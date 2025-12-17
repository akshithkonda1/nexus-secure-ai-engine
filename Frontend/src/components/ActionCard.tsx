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
      className="group relative flex items-center justify-between rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-5 py-4 text-left transition-all duration-200 hover:border-[var(--accent)]"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
    >
      <div className="relative flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className="h-6 w-6 text-[var(--accent)]" aria-hidden />
        </div>
        <div className="flex flex-col items-start">
          <span className="text-base font-semibold text-[var(--text-strong)]">{title}</span>
          {description && (
            <span className="text-xs text-[var(--text-muted)]">{description}</span>
          )}
        </div>
      </div>

      <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-subtle)] bg-[var(--layer-surface)] transition-all duration-200 group-hover:border-[var(--accent)]">
        <ArrowRight className="h-4 w-4 text-[var(--text-muted)] transition-colors duration-200 group-hover:text-[var(--accent)]" aria-hidden />
      </div>
    </motion.button>
  );
}
