import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { WorkspaceMode } from "./WorkspaceShell";
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
  const renderPanel = () => {
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
  };

  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 flex"
        >
          <div className="relative w-full h-full bg-white dark:bg-[#0b0f19] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden text-[var(--rz-text)]">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 px-3 py-1.5 text-sm rounded-full bg-white dark:bg-[#0e121b] border border-black/10 dark:border-white/10 transition"
            >
              Close
            </button>
            <div className="h-full w-full overflow-auto p-6 bg-white dark:bg-[#0e121b]">{renderPanel()}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkspacePopup;
