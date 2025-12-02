import React from "react";
import { Bell, Bot, Kanban, NotebookPen, Route as RouteIcon, StickyNote } from "lucide-react";
import { PanelKey } from "@/routes/workspace/RyuzenWorkspace";

interface LiquidOSBarProps {
  active: PanelKey;
  openPanel: (panel: PanelKey) => void;
}

const buttons: { key: PanelKey; label: string; icon: React.ReactNode }[] = [
  { key: "pages", label: "Pages", icon: <NotebookPen className="h-4 w-4" /> },
  { key: "notes", label: "Notes", icon: <StickyNote className="h-4 w-4" /> },
  { key: "boards", label: "Boards", icon: <Kanban className="h-4 w-4" /> },
  { key: "flows", label: "Flows", icon: <RouteIcon className="h-4 w-4" /> },
];

const LiquidOSBar: React.FC<LiquidOSBarProps> = ({ active, openPanel }) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-30 flex items-center justify-center px-6">
      <div className="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-[32px] border border-[var(--border-osbar)] bg-[var(--bg-osbar)] px-4 py-3 text-[var(--text-primary)] shadow-[0_4px_18px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {buttons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => openPanel(btn.key)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition hover:scale-[1.02] ${
                active === btn.key
                  ? "border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)]"
                  : "border-[var(--border-card)] bg-[var(--bg-widget)] text-[var(--text-primary)]"
              } shadow-[0_4px_18px_rgba(0,0,0,0.08)]`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
          <button
            onClick={() => openPanel("toron")}
            className="flex items-center gap-2 rounded-full border border-[#6d4aff] bg-[#6d4aff] px-3 py-2 text-sm text-white shadow-[0_4px_18px_rgba(0,0,0,0.18)] transition hover:scale-[1.02]"
          >
            <Bot className="h-4 w-4" /> Analyze with Toron
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPanel("notifications")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-card)] bg-[var(--bg-widget)] text-[var(--text-primary)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] transition hover:scale-105"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiquidOSBar;
