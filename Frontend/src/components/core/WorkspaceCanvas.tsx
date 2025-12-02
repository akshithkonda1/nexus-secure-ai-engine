import React from "react";
import { X } from "lucide-react";

interface WorkspaceCanvasProps {
  active: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ active, onClose, children }) => {
  return (
    <div className="relative h-full min-h-[420px] rounded-[36px] border border-white/10 bg-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
      {!active && (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/70">
          <p className="text-sm uppercase tracking-[0.35em] text-white/50">Ryuzеn Workspace Canvas</p>
          <p className="max-w-md text-lg text-white/80">Select a widget or tool to open a floating panel.</p>
        </div>
      )}
      {active && (
        <div className="absolute inset-0 overflow-hidden rounded-[36px] border border-white/10 bg-black/50 shadow-inner">
          <div className="absolute right-4 top-4 z-20">
            <button
              className="rounded-full border border-white/15 bg-white/10 p-2 text-white/80 shadow-lg backdrop-blur-2xl transition hover:scale-105 hover:border-white/30"
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
