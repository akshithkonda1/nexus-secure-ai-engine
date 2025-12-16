import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Zap, HelpCircle, MoreVertical } from "lucide-react";
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
        <h2 className="text-sm font-medium uppercase tracking-wide text-[var(--text-muted)]">{title}</h2>
        <motion.div
          className="h-1 w-12 rounded-full bg-gradient-to-r from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)]"
          initial={{ width: 0 }}
          animate={{ width: 48 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
            transition={{ duration: 0.2 }}
          />
          <Zap className="h-4 w-4" />
          <span>Upgrade</span>
        </motion.button>
        <motion.button
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:bg-[var(--layer-muted)]"
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
        >
          <HelpCircle className="h-5 w-5 text-[var(--text-muted)]" />
        </motion.button>
        <motion.button
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:bg-[var(--layer-muted)]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MoreVertical className="h-5 w-5 text-[var(--text-muted)]" />
        </motion.button>
      </div>
    </motion.header>
  );
}
