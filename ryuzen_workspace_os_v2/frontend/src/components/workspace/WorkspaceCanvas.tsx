import React from "react";
import PagesPanel from "./panels/PagesPanel";
import NotesPanel from "./panels/NotesPanel";
import BoardsPanel from "./panels/BoardsPanel";
import FlowsPanel from "./panels/FlowsPanel";
import ToronPanel from "./panels/ToronPanel";

export type WorkspaceMode = "pages" | "notes" | "boards" | "flows" | "toron" | null;

interface WorkspaceCanvasProps {
  mode: WorkspaceMode;
}

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ mode }) => {
  const renderPanel = () => {
    switch (mode) {
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
            return (
              <div className="flex flex-col gap-2 text-center items-center justify-center h-full">
                <p className="text-lg font-semibold text-[var(--rz-text)]">
                  Workspace Canvas
                </p>
                <p className="max-w-xl text-sm text-[var(--rz-text)]">
                  Select a workspace view from the OS bar to focus on pages, notes, boards, flows, or Toron analysis. Widgets open as
                  fullscreen modals for clarity.
                </p>
              </div>
            );
    }
  };

  return (
    <div className="relative w-full min-h-[60vh] overflow-hidden rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-white/10 dark:border-neutral-700/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-[10]">
      <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
      <div className="relative h-full w-full p-8 leading-relaxed text-neutral-800 dark:text-neutral-200">
        {renderPanel()}
      </div>
    </div>
  );
};

export default WorkspaceCanvas;
