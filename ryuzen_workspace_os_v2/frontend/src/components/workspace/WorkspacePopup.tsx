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
          animate={{ opacity: 1, scale: 1.01 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute inset-0 flex z-[20]"
        >
          <div className="relative w-full h-full rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl overflow-hidden z-10 animate-[fadeIn_120ms_ease-out]">
            <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 px-3 py-1.5 text-sm rounded-full bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl transition"
            >
              Close
            </button>
            <div className="relative h-full w-full overflow-auto p-6 md:p-8 leading-relaxed bg-white/85 dark:bg-neutral-900/85 text-neutral-800 dark:text-neutral-200">{renderPanel()}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkspacePopup;
