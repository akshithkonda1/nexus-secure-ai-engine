import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface WidgetExpansionModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const WidgetExpansionModal: React.FC<WidgetExpansionModalProps> = ({ open, title, onClose, children }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex h-[90vh] w-[96vw] max-w-6xl"
          >
            <div className={`flex h-full w-full flex-col overflow-hidden ${surfaceClass}`}>
              <div className="flex items-center justify-between border-b border-neutral-300/60 pb-3 dark:border-neutral-700/60">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h2 className="text-lg font-semibold text-textPrimary">{title}</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-300/50 px-4 text-sm font-semibold text-textPrimary transition hover:border-neutral-400 dark:border-neutral-700/50 dark:hover:border-neutral-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">{children}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WidgetExpansionModal;
