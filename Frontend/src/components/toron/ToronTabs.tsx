import { motion, AnimatePresence } from "framer-motion";
import type { ToronTab } from "@/state/toron/useToron";
import "@/styles/toron.css";

interface ToronTabsProps {
  activeTab: ToronTab;
  onChange: (tab: ToronTab) => void;
}

const tabs: { id: ToronTab; label: string; description: string }[] = [
  { id: "chats", label: "Chats", description: "Long-horizon conversations" },
  { id: "projects", label: "Projects", description: "Orchestrated builds" },
  { id: "workspace", label: "Workspace", description: "Live execution" },
];

export function ToronTabs({ activeTab, onChange }: ToronTabsProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className="group relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--panel-elevated)]/80 p-3 text-left shadow-sm transition hover:bg-[var(--border-soft)]/40 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--toron-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]"
          >
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="relative flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{tab.label}</span>
                  <div className="h-5 w-5 rounded bg-[var(--border-soft)]" />
                </div>
                <p className="text-xs text-[var(--text-secondary)]">{tab.description}</p>
              </div>
              <motion.div
                layoutId="toron-tab-indicator"
                className="h-10 w-10 rounded-full border border-[var(--border-soft)] bg-[var(--surface-card)]/80 shadow-inner"
                animate={{
                  boxShadow:
                    activeTab === tab.id
                      ? "0 10px 35px rgba(124,93,255,0.22), 0 6px 16px rgba(34,197,94,0.18)"
                      : "0 4px 14px rgba(0,0,0,0.15)",
                }}
                transition={{ type: "spring", stiffness: 240, damping: 28 }}
              >
                <AnimatePresence>
                  {activeTab === tab.id && (
                    <motion.div
                      key={tab.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      className="toron-pulse" 
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
            <motion.div
              layout
              className={`absolute inset-0 -z-10 opacity-0 transition duration-200 group-hover:opacity-100 ${activeTab === tab.id ? "opacity-100" : ""}`}
            >
              <div className="toron-tile-glow" />
            </motion.div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ToronTabs;
