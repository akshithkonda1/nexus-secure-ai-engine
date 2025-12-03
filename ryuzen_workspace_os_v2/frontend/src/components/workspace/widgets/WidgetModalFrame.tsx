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
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(12px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="w-11/12 h-[90vh] max-w-5xl relative overflow-hidden"
          style={{
            background: "var(--rz-surface)",
            border: `1px solid var(--rz-border)` ,
            borderRadius: "var(--rz-radius)",
            boxShadow: `0 14px 40px var(--rz-shadow)` ,
            color: "var(--rz-text-primary)",
          }}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid var(--rz-border)` }}>
            <div>
              <p className="text-sm" style={{ color: "var(--rz-text-secondary)" }}>
                Ryuzen Widget
              </p>
              <h2 className="text-xl font-semibold" style={{ color: "var(--rz-text-primary)" }}>
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeWidget}
              className="px-3 py-1.5 rounded-full text-sm"
              style={{
                border: `1px solid var(--rz-border)` ,
                background: "var(--rz-surface-glass)",
                color: "var(--rz-text-primary)",
                transition: `all var(--rz-duration) ease`,
              }}
            >
              Close
            </button>
          </div>
          <div className="h-full overflow-auto px-5 pb-5">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default WidgetModalFrame;
