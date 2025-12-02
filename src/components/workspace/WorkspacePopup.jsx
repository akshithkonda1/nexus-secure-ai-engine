import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PagesPanel from "./panels/PagesPanel";
import NotesPanel from "./panels/NotesPanel";
import BoardsPanel from "./panels/BoardsPanel";
import FlowsPanel from "./panels/FlowsPanel";

const WorkspacePopup = ({ mode, onClose }) => {
  const PanelComponent = useMemo(() => {
    switch (mode) {
      case "pages":
        return <PagesPanel />;
      case "notes":
        return <NotesPanel />;
      case "boards":
        return <BoardsPanel />;
      case "flows":
        return <FlowsPanel />;
      default:
        return null;
    }
  }, [mode]);

  return (
    <AnimatePresence>
      {mode && PanelComponent ? (
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 z-20 flex items-center justify-center"
        >
          <div className="relative w-full max-w-4xl rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-8 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-[var(--glass-blur)]">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-[var(--border-card)] bg-[var(--bg-widget)] px-3 py-1 text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)] hover:bg-white/10"
            >
              Close
            </button>
            {PanelComponent}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default WorkspacePopup;
