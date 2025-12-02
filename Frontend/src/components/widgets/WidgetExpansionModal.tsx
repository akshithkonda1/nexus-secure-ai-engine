import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";

interface WidgetExpansionModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const WidgetExpansionModal: React.FC<WidgetExpansionModalProps> = ({ open, title, onClose, children }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-3xl dark:bg-black/60"
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
            <div
              className={`flex h-full w-full flex-col overflow-hidden rounded-3xl border shadow-xl transition-all duration-300 ${
                isDark ? "border-white/10 bg-neutral-900 text-white" : "border-black/5 bg-white text-black"
              }`}
            >
              <div
                className={`flex items-center justify-between border-b px-6 py-4 ${
                  isDark ? "border-white/10" : "border-black/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition ${
                    isDark
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-neutral-200 text-black hover:bg-neutral-300"
                  }`}
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
