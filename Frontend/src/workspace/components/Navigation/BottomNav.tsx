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
    <nav className="relative fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-3rem)] max-w-4xl -translate-x-1/2 items-center justify-between rounded-full border border-tileBorder bg-tile bg-tileGradient px-4 py-3 text-sm text-textSecondary shadow-tile before:absolute before:inset-0 before:rounded-full before:bg-tileInner before:content-[''] before:pointer-events-none transition-all duration-300 hover:border-tileBorderStrong hover:shadow-tileStrong">
      {workspaceRoutes.map((item) => (
        <button
          key={item.key}
          onClick={() => handleClick(item.key)}
          className={`flex-1 rounded-full px-3 py-2 transition ${
            route === item.key
              ? "bg-emerald-600 text-textPrimary shadow-tile"
              : "bg-transparent text-textSecondary hover:bg-tileInner"
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};
