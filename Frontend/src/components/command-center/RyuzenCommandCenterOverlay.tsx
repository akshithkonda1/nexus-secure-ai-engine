import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useUI } from "@/state/ui";
import { ToronGrid } from "@/components/command-center/ToronGrid";

export function RyuzenCommandCenterOverlay() {
  const { isCommandCenterOpen, closeCommandCenter } = useUI();

  return (
    <AnimatePresence>
      {isCommandCenterOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCommandCenter}
        >
          <motion.div
            className="glass-panel relative w-[min(1040px,95vw)] rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.28, ease: "easeOut" } }}
            exit={{ scale: 0.94, opacity: 0, transition: { duration: 0.2 } }}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Ryuzen Command Center</p>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Toron dashboard</h2>
              </div>
              <button
                onClick={closeCommandCenter}
                className="rounded-full border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_90%,transparent)] p-2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                aria-label="Close command center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ToronGrid />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
