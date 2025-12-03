import React from "react";
import { X } from "lucide-react";

interface WorkspaceCanvasProps {
  active: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const glassPanelClass =
  "bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong";

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ active, onClose, children }) => {
  return (
    <div className={`relative h-full min-h-[420px] ${glassPanelClass}`}>
      {!active && (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-textSecondary">Ryuzen Workspace Canvas</p>
          <p className="max-w-md text-lg text-textMuted">
            Pages, notes, boards, flows, and Toron live here. Widgets expand into their own windows.
          </p>
        </div>
      )}
      {active && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl border border-glassBorder bg-glass backdrop-blur-2xl">
          <div className="absolute right-4 top-4 z-20">
            <button
              className="rounded-full border border-glassBorder px-3 py-2 text-sm font-semibold text-textPrimary transition hover:border-glassBorderStrong"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative z-10 h-full overflow-y-auto p-6 text-textPrimary">{children}</div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceCanvas;
