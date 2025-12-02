import React from "react";
import WorkspacePopup from "./WorkspacePopup";
import { WorkspaceMode } from "./WorkspaceShell";

interface WorkspaceCanvasProps {
  mode: WorkspaceMode;
  onClose: () => void;
}

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ mode, onClose }) => {
  return (
    <div className="relative flex h-full items-center justify-center rounded-3xl bg-gradient-to-br from-white/5 to-transparent p-6 shadow-[0_0_60px_rgba(0,0,0,0.3)] border border-white/10">
      {mode === null ? (
        <div className="text-center text-white/60">Select a widget or OS tool to open its panel.</div>
      ) : null}
      <WorkspacePopup mode={mode} onClose={onClose} />
    </div>
  );
};

export default WorkspaceCanvas;
