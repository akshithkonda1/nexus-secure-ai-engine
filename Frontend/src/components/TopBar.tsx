import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Zap, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const labels: Record<string, string> = {
  "/": "Home",
  "/toron": "Toron",
  "/workspace": "Workspace",
  "/settings": "Settings",
  "/projects": "Projects",
  "/templates": "Templates",
  "/documents": "Documents",
  "/community": "Community",
  "/history": "History",
  "/help": "Help",
};

export default function TopBar() {
  const location = useLocation();

  const title = useMemo(() => labels[location.pathname] ?? "Home", [location.pathname]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between pb-6"
    >
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Dashboard</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">{title}</h2>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <motion.button
          className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] px-4 py-2 text-sm font-semibold text-white transition-all duration-150"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Zap className="h-4 w-4" />
          <span>Upgrade</span>
        </motion.button>
        <motion.button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-subtle)] bg-[var(--layer-surface)] text-[var(--text-muted)] transition-colors duration-150 hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <HelpCircle className="h-5 w-5" />
        </motion.button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-subtle)] bg-[var(--layer-muted)] text-sm font-semibold text-[var(--text-strong)]">
          EC
        </div>
      </div>
    </motion.header>
  );
}
