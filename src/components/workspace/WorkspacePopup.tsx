import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WorkspaceMode } from "./WorkspaceShell";
import ListsPanel from "./panels/ListsPanel";
import CalendarPanel from "./panels/CalendarPanel";
import ConnectorsPanel from "./panels/ConnectorsPanel";
import TasksPanel from "./panels/TasksPanel";
import PagesPanel from "./panels/PagesPanel";
import NotesPanel from "./panels/NotesPanel";
import BoardsPanel from "./panels/BoardsPanel";
import FlowsPanel from "./panels/FlowsPanel";
import ToronPanel from "./panels/ToronPanel";

interface WorkspacePopupProps {
  mode: WorkspaceMode;
  onClose: () => void;
}

const WorkspacePopup: React.FC<WorkspacePopupProps> = ({ mode, onClose }) => {
  const PanelComponent = useMemo(() => {
    switch (mode) {
      case "lists":
        return <ListsPanel />;
      case "calendar":
        return <CalendarPanel />;
      case "connectors":
        return <ConnectorsPanel />;
      case "tasks":
        return <TasksPanel />;
      case "pages":
        return <PagesPanel />;
      case "notes":
        return <NotesPanel />;
      case "boards":
        return <BoardsPanel />;
      case "flows":
        return <FlowsPanel />;
      case "toron":
        return <ToronPanel />;
      default:
        return null;
    }
  }, [mode]);

  return (
    <AnimatePresence>
      {mode !== null && PanelComponent ? (
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 z-20 flex items-center justify-center"
        >
          <div className="relative w-full max-w-3xl rounded-3xl border border-white/20 bg-white/10 p-8 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-white/80 hover:bg-white/20"
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
