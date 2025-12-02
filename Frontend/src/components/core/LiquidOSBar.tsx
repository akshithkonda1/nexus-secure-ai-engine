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
      <div className="pointer-events-auto flex w-full max-w-4xl items-center justify-between rounded-[32px] border border-black/10 bg-black/5 px-4 py-3 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-2">
          {buttons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => openPanel(btn.key)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition hover:scale-[1.02] ${
                active === btn.key
                  ? "border-black/20 bg-black/10 text-black dark:border-white/40 dark:bg-white/10 dark:text-white"
                  : "border-black/10 bg-black/5 text-black/80 dark:border-white/15 dark:bg-white/10 dark:text-white/80"
              } shadow-[0_4px_18px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]`}
            >
              {btn.icon}
              {btn.label}
            </button>
          ))}
          <button
            onClick={() => openPanel("toron")}
            className="flex items-center gap-2 rounded-full border border-[#6d4aff] bg-[#6d4aff] px-3 py-2 text-sm text-white shadow-[0_4px_18px_rgba(0,0,0,0.18)] transition hover:scale-[1.02] dark:border-[#6d4aff] dark:bg-[#6d4aff]"
          >
            <Bot className="h-4 w-4" /> Analyze with Toron
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openPanel("notifications")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-black/10 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] transition hover:scale-105 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            onClick={() => openPanel("profile")}
            className="h-10 w-10 rounded-full border border-black/10 bg-black/10 ring-0 transition hover:scale-105 dark:border-white/10 dark:bg-white/10"
          />
        </div>
      </div>
    </div>
  );
};

export default LiquidOSBar;
