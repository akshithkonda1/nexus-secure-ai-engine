import React from "react";
import type { WorkspaceMode } from "../WorkspaceCanvas";

interface OSBarProps {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
}

const OSBar: React.FC<OSBarProps> = ({ mode, setMode }) => {
  const handleSelect = (nextMode: WorkspaceMode) => {
    setMode(mode === nextMode ? null : nextMode);
  };

  const buttonStyle = (active: boolean) => ({
    border: `1px solid var(--rz-border)`,
    background: active ? "var(--rz-surface-glass)" : "var(--rz-surface)",
    color: "var(--rz-text)",
    transition: `all var(--rz-duration) ease`,
  });

  return (
    <div
      className="relative w-full px-4 py-3 rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-white/10 dark:border-neutral-700/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-[10]"
    >
      <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {["pages", "notes", "boards", "flows"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSelect(item as WorkspaceMode)}
              className="relative px-4 py-2 rounded-xl capitalize leading-relaxed text-neutral-800 dark:text-neutral-200"
              style={buttonStyle(mode === item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelect("toron")}
            className="relative px-4 py-2 rounded-xl leading-relaxed text-neutral-800 dark:text-neutral-200"
            style={buttonStyle(mode === "toron")}
          >
            Analyze with Toron
          </button>
          <button
            type="button"
            className="relative px-3 py-2 rounded-xl leading-relaxed text-neutral-800 dark:text-neutral-200"
            style={buttonStyle(false)}
            aria-label="Notifications"
          >
            🔔
          </button>
        </div>
      </div>
    </div>
  );
};

export default OSBar;
