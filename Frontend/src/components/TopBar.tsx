import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Zap, HelpCircle, PanelLeft, PanelRight } from "lucide-react";
import { cn, bg, text, border } from "../utils/theme";

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

type TopBarProps = {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
};

export default function TopBar({ onToggleSidebar, sidebarCollapsed = false }: TopBarProps) {
  const location = useLocation();

  const title = useMemo(() => labels[location.pathname] ?? "Home", [location.pathname]);

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggleSidebar?.()}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition",
            border.subtle,
            bg.surface,
            text.muted,
            "hover:border-[var(--line-strong)] hover:text-[var(--text)]"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </button>
        <h2 className={cn("text-lg font-semibold", text.primary)}>{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <button
          className={cn(
            "group relative flex items-center gap-2 overflow-hidden rounded-lg px-4 py-1.5 text-sm font-semibold shadow-sm transition-all hover:shadow-md",
            bg.accent,
            text.inverse
          )}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Upgrade</span>
        </button>
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            text.muted,
            "hover:text-[var(--text)]"
          )}
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shadow-inner",
          bg.elevated,
          text.primary
        )}>
          EC
        </div>
      </div>
    </div>
  );
}
