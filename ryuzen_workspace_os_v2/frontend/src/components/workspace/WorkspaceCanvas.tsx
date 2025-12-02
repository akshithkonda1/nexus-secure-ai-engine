import React from "react";
import type { WorkspaceMode } from "./WorkspaceShell";

interface WorkspaceCanvasProps {
  mode: WorkspaceMode;
  onOpenTasks: () => void;
  children?: React.ReactNode;
}

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ mode, onOpenTasks, children }) => {
  return (
    <div className="relative w-full min-h-[60vh] bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl p-8 overflow-hidden shadow-2xl">
      {!mode && (
        <div className="flex flex-col items-center justify-center text-center text-slate-200/80 gap-3 pointer-events-none">
          <p className="text-lg font-semibold text-white">Workspace Canvas</p>
          <p className="max-w-xl text-sm">
            Select a widget or OS tool to open a focused workspace panel. Everything stays contained inside this glass canvas.
          </p>
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={onOpenTasks}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-white hover:bg-white/15 transition"
            >
              Open Tasks Panel
            </button>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default WorkspaceCanvas;
