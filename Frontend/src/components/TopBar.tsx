import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Zap, HelpCircle } from "lucide-react";

const labels: Record<string, string> = {
  "/": "Home",
  "/toron": "Toron",
  "/workspace": "Workspace",
  "/settings": "Settings",
  "/projects": "Projects",
  "/templates": "Templates",
  "/documents": "Documents",
  "/community": "Community",
  "/history": "History",
  "/help": "Help",
};

export default function TopBar() {
  const location = useLocation();

  const title = useMemo(() => labels[location.pathname] ?? "Home", [location.pathname]);

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle placeholder if needed */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Upgrade</span>
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-900 dark:bg-slate-700 dark:text-slate-100">
          EC
        </div>
      </div>
    </div>
  );
}
