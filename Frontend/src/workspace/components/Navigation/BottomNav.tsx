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
    <nav className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-3rem)] max-w-4xl -translate-x-1/2 items-center justify-between rounded-full bg-neutral-900/80 px-4 py-3 text-sm text-neutral-200 shadow-2xl ring-1 ring-neutral-800 backdrop-blur">
      {workspaceRoutes.map((item) => (
        <button
          key={item.key}
          onClick={() => handleClick(item.key)}
          className={`flex-1 rounded-full px-3 py-2 transition ${
            route === item.key ? "bg-emerald-600 text-white" : "hover:bg-neutral-800"
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};
