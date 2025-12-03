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
      className="w-full px-4 py-3"
      style={{
        borderRadius: "var(--rz-radius)",
        background: "var(--rz-surface)",
        border: `1px solid var(--rz-border)`,
        boxShadow: `0 10px 30px var(--rz-shadow)` ,
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {["pages", "notes", "boards", "flows"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSelect(item as WorkspaceMode)}
              className="px-4 py-2 rounded-xl capitalize"
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
            className="px-4 py-2 rounded-xl"
            style={buttonStyle(mode === "toron")}
          >
            Analyze with Toron
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-xl"
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
