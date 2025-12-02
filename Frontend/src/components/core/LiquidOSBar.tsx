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
      <div className="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-[36px] border border-white/15 bg-white/10 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
        <div className="flex items-center gap-2">
          {buttons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => openPanel(btn.key)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm text-white transition hover:scale-[1.02] hover:border-white/40 ${
                active === btn.key ? "border-white/50 bg-white/15" : "border-white/15 bg-white/5"
              }`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
          <button
            onClick={() => openPanel("toron")}
            className="flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-500/20 px-3 py-2 text-sm text-purple-50 shadow-lg transition hover:scale-[1.02]"
          >
            <Bot className="h-4 w-4" /> Analyze with Toron
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPanel("notifications")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg transition hover:scale-105 hover:border-white/30"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            onClick={() => openPanel("profile")}
            className="h-10 w-10 rounded-full bg-gradient-to-br from-white/20 via-white/10 to-white/5 ring-1 ring-white/30 transition hover:scale-105"
          />
        </div>
      </div>
    </div>
  );
};

export default LiquidOSBar;
