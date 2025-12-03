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
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={{ duration: 0.24 }}
          className="relative flex h-[calc(100vh-32px)] w-[calc(100vw-32px)] flex-col overflow-hidden"
          style={{
            background: "var(--rz-surface)",
            border: `1px solid var(--rz-border)` ,
            borderRadius: "var(--rz-radius)",
            boxShadow: `0 14px 40px var(--rz-shadow)` ,
            color: "var(--rz-text)",
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{
              borderBottom: `1px solid var(--rz-border)` ,
              background: "var(--rz-surface-glass)",
            }}
          >
            <div className="space-y-1 text-[var(--rz-text)]">
              <p className="text-sm text-[var(--rz-text)]">Ryuzen Widget</p>
              <h2 className="text-xl font-semibold text-[var(--rz-text)]">{title}</h2>
            </div>
            <button
              type="button"
              onClick={closeWidget}
              className="rounded-full px-4 py-2 text-sm text-[var(--rz-text)]"
              style={{
                border: `1px solid var(--rz-border)` ,
                background: "var(--rz-surface-glass)",
                transition: `all var(--rz-duration) ease`,
              }}
            >
              Close
            </button>
          </div>
          <div className="h-full overflow-auto px-6 pb-6 text-[var(--rz-text)]">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default WidgetModalFrame;
