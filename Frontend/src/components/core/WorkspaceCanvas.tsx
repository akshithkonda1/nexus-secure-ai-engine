import React from "react";
import { X } from "lucide-react";

interface WorkspaceCanvasProps {
  active: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ active, onClose, children }) => {
  return (
    <div className="ryuzen-card relative h-full min-h-[420px] bg-[var(--bg-widget)] text-[var(--text-primary)]">
      {!active && (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[var(--text-secondary)]">Ryuzеn Workspace Canvas</p>
          <p className="max-w-md text-lg text-[var(--text-secondary)]">Select a widget or tool to open a floating panel.</p>
        </div>
      )}
      {active && (
        <div className="absolute inset-0 overflow-hidden rounded-[32px] border border-[var(--border-card)] bg-[var(--bg-card)] shadow-inner">
          <div className="absolute right-4 top-4 z-20">
            <button
              className="rounded-full border border-[var(--border-card)] bg-[var(--bg-widget)] p-2 text-[var(--text-primary)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-2xl transition hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative z-10 h-full overflow-y-auto p-6">{children}</div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceCanvas;
