import React from "react";
import type { WorkspaceMode } from "../WorkspaceShell";

interface OSBarProps {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
}

const OSBar: React.FC<OSBarProps> = ({ mode, setMode }) => {
  const handleSelect = (nextMode: WorkspaceMode) => {
    setMode(mode === nextMode ? null : nextMode);
  };

  return (
    <div className="w-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["pages", "notes", "boards", "flows"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSelect(item as WorkspaceMode)}
              className={`px-4 py-2 rounded-xl border border-white/10 backdrop-blur-lg transition hover:bg-white/10 capitalize ${
                mode === item ? "bg-white/15" : "bg-white/5"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelect("toron")}
            className={`px-4 py-2 rounded-xl border border-white/10 backdrop-blur-lg transition hover:bg-white/10 ${
              mode === "toron" ? "bg-white/15" : "bg-white/5"
            }`}
          >
            Analyze with Toron
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition"
          >
            🔔
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition"
          >
            👤
          </button>
        </div>
      </div>
    </div>
  );
};

export default OSBar;
