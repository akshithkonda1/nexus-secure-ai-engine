import React from "react";
import { Bell, User } from "lucide-react";

const items = [
  { key: "pages", label: "Pages" },
  { key: "notes", label: "Notes" },
  { key: "boards", label: "Boards" },
  { key: "flows", label: "Flows" },
  { key: "toron", label: "Analyze with Toron" },
];

const OSBar = ({ activeMode, onSelect }) => {
  return (
    <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] px-4 py-2 shadow-[0_0_60px_rgba(0,0,0,0.3)] backdrop-blur-[var(--glass-blur)]">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-primary)]">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`rounded-2xl px-4 py-2 transition duration-150 ${
              activeMode === item.key ? "bg-[var(--btn-bg)] text-[var(--btn-text)]" : "text-[var(--text-secondary)] hover:bg-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          onClick={() => onSelect("notes")}
          className={`rounded-full p-2 transition duration-150 ${
            activeMode === "notes" ? "bg-[var(--btn-bg)] text-[var(--btn-text)]" : "text-[var(--text-secondary)] hover:bg-white/10"
          }`}
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={2} aria-hidden />
        </button>
        <button
          onClick={() => onSelect("pages")}
          className={`rounded-full p-2 transition duration-150 ${
            activeMode === "pages" ? "bg-[var(--btn-bg)] text-[var(--btn-text)]" : "text-[var(--text-secondary)] hover:bg-white/10"
          }`}
          aria-label="User"
        >
          <User size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default OSBar;
