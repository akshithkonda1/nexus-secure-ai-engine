import React from "react";
import { workspaceRoutes, WorkspaceRoute } from "../../app/routes";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";

export type BottomNavProps = {
  onAnalyze: () => void;
};

export const BottomNav: React.FC<BottomNavProps> = ({ onAnalyze }) => {
  const { route, setRoute } = useWorkspace();

  const handleClick = (key: WorkspaceRoute) => {
    if (key === "analyze") {
      onAnalyze();
      return;
    }
    setRoute(key);
  };

  return (
    <nav className="relative fixed bottom-4 left-1/2 z-[10] flex w-[calc(100%-3rem)] max-w-4xl -translate-x-1/2 items-center justify-between rounded-full border border-neutral-300/50 dark:border-neutral-700/50 bg-white/85 dark:bg-neutral-900/85 px-6 md:px-8 py-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-300 hover:scale-[1.01]">
      <div className="absolute inset-0 pointer-events-none rounded-full backdrop-blur-xl" />
      {workspaceRoutes.map((item) => (
        <button
          key={item.key}
          onClick={() => handleClick(item.key)}
          className={`relative flex-1 rounded-full px-3 py-2 transition-transform duration-300 ${
            route === item.key
              ? "bg-emerald-600 text-neutral-50 shadow-[0_4px_20px_rgba(0,0,0,0.15)] scale-[1.01]"
              : "bg-transparent text-neutral-700 dark:text-neutral-300 hover:scale-[1.01]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};
