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
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle placeholder if needed */}
        <h2 className="text-lg font-semibold text-[var(--text-strong)]">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <motion.button
          className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-[var(--text-strong)] px-4 py-1.5 text-sm font-semibold text-[var(--bg-app)] transition-all duration-150"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Upgrade</span>
        </motion.button>
        <motion.button
          className="flex h-8 w-8 items-center justify-center text-[var(--text-muted)] transition-colors duration-150 hover:text-[var(--text-primary)]"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <HelpCircle className="h-5 w-5" />
        </motion.button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--layer-muted)] text-xs font-semibold text-[var(--text-strong)] ring-2 ring-[var(--bg-app)]">
          EC
        </div>
      </div>
    </div>
  );
}
