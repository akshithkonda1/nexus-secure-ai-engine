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
          ? "border-borderLight/10 bg-bgElevated text-textPrimary shadow-black/30"
          : "border-borderLight/5 bg-bgPrimary text-textPrimary"
      }`}
    >
      {!active && (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-textSecondary dark:text-textMuted">
            Ryuzen Workspace Canvas
          </p>
          <p className="max-w-md text-lg text-textSecondary dark:text-textMuted">
            Pages, notes, boards, flows, and Toron live here. Widgets expand into their own windows.
          </p>
        </div>
      )}
      {active && (
        <div
          className={`absolute inset-0 overflow-hidden rounded-[28px] border ${
            isDark ? "border-borderLight/10 bg-bgElevated" : "border-borderLight/5 bg-bgPrimary"
          }`}
        >
          <div className="absolute right-4 top-4 z-20">
            <button
              className={`rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition ${
                isDark
                  ? "border border-borderLight/15 bg-bgElevated text-textPrimary hover:bg-bgSecondary"
                  : "border border-borderLight/10 bg-bgPrimary text-textPrimary hover:bg-bgPrimary"
              }`}
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative z-10 h-full overflow-y-auto p-6 text-textPrimary dark:text-textMuted">{children}</div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceCanvas;
