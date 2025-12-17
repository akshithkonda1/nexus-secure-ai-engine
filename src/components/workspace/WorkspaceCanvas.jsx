import React from "react";
import WorkspacePopup from "./WorkspacePopup";

const WorkspaceCanvas = ({ mode, onClose }) => {
  return (
    <div className="relative flex min-h-[280px] w-full items-center justify-center rounded-3xl border border-[var(--border-card)] bg-gradient-to-br from-white/5 to-transparent p-6 shadow-[0_0_60px_rgba(0,0,0,0.3)]">
      {mode ? (
        <WorkspacePopup mode={mode} onClose={onClose} />
      ) : (
        <div className="text-center text-[var(--text-secondary)]">
          Open Pages, Notes, Boards, or Flows from the OS bar to load them inside the canvas. Widgets stay in their own cards.
        </div>
      )}
    </div>
  );
};

export default WorkspaceCanvas;
