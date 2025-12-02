import React from "react";
import { WorkspaceMode } from "../WorkspaceShell";

interface OSBarProps {
  activeMode: WorkspaceMode;
  onSelect: (mode: WorkspaceMode) => void;
}

const items: { key: WorkspaceMode; label: string; icon?: string }[] = [
  { key: "pages", label: "Pages" },
  { key: "notes", label: "Notes" },
  { key: "boards", label: "Boards" },
  { key: "flows", label: "Flows" },
  { key: "toron", label: "Analyze with Toron" },
];

const OSBar: React.FC<OSBarProps> = ({ activeMode, onSelect }) => {
  return (
    <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-3xl border border-white/10 bg-white/10 px-4 py-2 shadow-[0_0_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`rounded-2xl px-4 py-2 transition duration-150 ${
              activeMode === item.key ? "bg-white/20 shadow-xl" : "hover:bg-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => onSelect("notes")}
          className={`rounded-full p-2 transition duration-150 ${
            activeMode === "notes" ? "bg-white/20 shadow-xl" : "hover:bg-white/10"
          }`}
          aria-label="Notifications"
        >
          <span className="text-lg">🔔</span>
        </button>
        <button
          onClick={() => onSelect("pages")}
          className={`rounded-full p-2 transition duration-150 ${
            activeMode === "pages" ? "bg-white/20 shadow-xl" : "hover:bg-white/10"
          }`}
          aria-label="User"
        >
          <span className="text-lg">👤</span>
        </button>
      </div>
    </div>
  );
};

export default OSBar;
