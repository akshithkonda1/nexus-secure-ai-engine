import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { WorkspaceMode } from './WorkspaceShell';
import ListsPanel from './panels/ListsPanel';
import CalendarPanel from './panels/CalendarPanel';
import ConnectorsPanel from './panels/ConnectorsPanel';
import TasksPanel from './panels/TasksPanel';
import PagesPanel from './panels/PagesPanel';
import NotesPanel from './panels/NotesPanel';
import BoardsPanel from './panels/BoardsPanel';
import FlowsPanel from './panels/FlowsPanel';
import ToronPanel from './panels/ToronPanel';

interface WorkspacePopupProps {
  mode: WorkspaceMode;
  onClose: () => void;
  setMode: (mode: WorkspaceMode) => void;
}

const renderPanel = (mode: WorkspaceMode, setMode: (mode: WorkspaceMode) => void) => {
  switch (mode) {
    case 'lists':
      return <ListsPanel onSelectTasks={() => setMode('tasks')} />;
    case 'calendar':
      return <CalendarPanel />;
    case 'connectors':
      return <ConnectorsPanel />;
    case 'tasks':
      return <TasksPanel />;
    case 'pages':
      return <PagesPanel />;
    case 'notes':
      return <NotesPanel />;
    case 'boards':
      return <BoardsPanel />;
    case 'flows':
      return <FlowsPanel />;
    case 'toron':
      return <ToronPanel />;
    default:
      return null;
  }
};

const WorkspacePopup: React.FC<WorkspacePopupProps> = ({ mode, onClose, setMode }) => {
  return (
    <AnimatePresence>
      {mode && (
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center p-6"
        >
          <div className="relative w-full max-w-4xl pointer-events-auto">
            <button
              onClick={onClose}
              className="absolute -right-3 -top-3 z-10 h-10 w-10 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 active:bg-white/30 backdrop-blur-xl shadow-lg"
            >
              ✕
            </button>
            <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl p-6">
              {renderPanel(mode, setMode)}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorkspacePopup;
