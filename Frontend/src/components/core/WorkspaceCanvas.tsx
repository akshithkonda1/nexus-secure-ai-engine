import React from "react";
import { X } from "lucide-react";
import { useTheme } from "@/theme/ThemeProvider";

interface WorkspaceCanvasProps {
  active: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ active, onClose, children }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div
      className={`relative h-full min-h-[420px] rounded-3xl border shadow-xl transition ${
        isDark
          ? "border-white/10 bg-neutral-950 text-white shadow-black/30"
          : "border-black/5 bg-white text-black"
      }`}
    >
      {!active && (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">
            Ryuzen Workspace Canvas
          </p>
          <p className="max-w-md text-lg text-neutral-700 dark:text-neutral-200">
            Pages, notes, boards, flows, and Toron live here. Widgets expand into their own windows.
          </p>
        </div>
      )}
      {active && (
        <div
          className={`absolute inset-0 overflow-hidden rounded-[28px] border ${
            isDark ? "border-white/10 bg-neutral-900" : "border-black/5 bg-neutral-50"
          }`}
        >
          <div className="absolute right-4 top-4 z-20">
            <button
              className={`rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition ${
                isDark
                  ? "border border-white/15 bg-neutral-800 text-white hover:bg-neutral-700"
                  : "border border-black/10 bg-white text-black hover:bg-neutral-100"
              }`}
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative z-10 h-full overflow-y-auto p-6 text-neutral-900 dark:text-neutral-100">{children}</div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceCanvas;
