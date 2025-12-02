import React from "react";
import { Bell, Bot, Kanban, NotebookPen, Route as RouteIcon, StickyNote, User } from "lucide-react";
import { PanelKey } from "@/routes/workspace/RyuzenWorkspace";

interface LiquidOSBarProps {
  activePanel: PanelKey;
  openPanel: (panel: PanelKey) => void;
}

const buttons: { key: PanelKey; label: string; icon: React.ReactNode }[] = [
  { key: "pages", label: "Pages", icon: <NotebookPen className="h-4 w-4" /> },
  { key: "notes", label: "Notes", icon: <StickyNote className="h-4 w-4" /> },
  { key: "boards", label: "Boards", icon: <Kanban className="h-4 w-4" /> },
  { key: "flows", label: "Flows", icon: <RouteIcon className="h-4 w-4" /> },
];

const LiquidOSBar: React.FC<LiquidOSBarProps> = ({ activePanel, openPanel }) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-40 flex items-center justify-center px-6">
      <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-[36px] border border-white/10 bg-white/5 px-5 py-3 text-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="flex items-center gap-2 text-sm">
          {buttons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => openPanel(btn.key)}
              className={`flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-white/90 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98] ${
                activePanel === btn.key ? "border border-white/20 bg-white/20" : "border border-white/10"
              }`}
            >
              {btn.icon}
              <span className="font-medium">{btn.label}</span>
            </button>
          ))}
          <button
            onClick={() => openPanel("toron")}
            className="flex items-center gap-2 rounded-full bg-[#6d4aff] px-4 py-2 text-white shadow-[0_2px_10px_rgba(109,74,255,0.4)] transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
          >
            <Bot className="h-4 w-4" />
            <span className="font-semibold">Analyze with Toron</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openPanel("notifications")}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/90 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98] ${
              activePanel === "notifications" ? "border border-white/25" : "border border-white/10"
            }`}
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            onClick={() => openPanel("profile")}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/90 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98] ${
              activePanel === "profile" ? "border border-white/25" : "border border-white/10"
            }`}
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiquidOSBar;
