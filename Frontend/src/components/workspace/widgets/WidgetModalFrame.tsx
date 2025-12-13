import React from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWidgetManager } from "../../../state/useWidgetManager";

interface WidgetModalFrameProps {
  title: string;
  children: React.ReactNode;
}

const WidgetModalFrame: React.FC<WidgetModalFrameProps> = ({ title, children }) => {
  const { currentWidget, closeWidget } = useWidgetManager();

  if (!currentWidget) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        key={currentWidget}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[30] flex items-center justify-center p-4"
        style={{ background: "var(--overlay-scrim)", backdropFilter: "blur(16px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1.01, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={{ duration: 0.24 }}
          className="relative flex h-[calc(100vh-32px)] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl z-10 animate-[fadeIn_120ms_ease-out]"
        >
          <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
          <div className="relative flex items-center justify-between px-6 md:px-8 py-4 border-b border-neutral-300/50 dark:border-neutral-700/50 bg-white/85 dark:bg-neutral-900/85 leading-relaxed">
            <div className="space-y-1">
              <p className="text-sm">Ryuzen Widget</p>
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            <button
              type="button"
              onClick={closeWidget}
              className="rounded-full px-4 py-2 text-sm border border-neutral-300/50 dark:border-neutral-700/50 bg-white/85 dark:bg-neutral-900/85 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl leading-relaxed"
            >
              Close
            </button>
          </div>
          <div className="relative h-full overflow-auto px-6 md:px-8 pb-6 md:pb-8 leading-relaxed text-neutral-800 dark:text-neutral-200 bg-white/85 dark:bg-neutral-900/85">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default WidgetModalFrame;
