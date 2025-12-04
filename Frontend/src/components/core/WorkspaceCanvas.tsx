import React from "react";
import { X } from "lucide-react";

interface WorkspaceCanvasProps {
  active: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ active, onClose, children }) => {
  return (
    <div className={`relative h-full min-h-[420px] ${surfaceClass}`}>
      {!active && (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-textSecondary">Ryuzen Workspace Canvas</p>
          <p className="max-w-md text-lg text-textMuted">
            Pages, notes, boards, flows, and Toron live here. Widgets expand into their own windows.
          </p>
        </div>
      )}
      {active && (
        <div className="absolute inset-0 overflow-hidden rounded-3xl border border-neutral-300/50 bg-white/90 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/90">
          <div className="absolute right-4 top-4 z-20">
            <button
              className="rounded-full border border-neutral-300/50 px-3 py-2 text-sm font-semibold text-textPrimary transition hover:border-neutral-400 dark:border-neutral-700/50 dark:hover:border-neutral-600"
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
