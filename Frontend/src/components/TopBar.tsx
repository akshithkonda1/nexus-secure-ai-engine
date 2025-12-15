import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Zap, HelpCircle, MoreVertical } from "lucide-react";

const labels: Record<string, string> = {
  "/": "AI Chat",
  "/projects": "Projects",
  "/templates": "Templates",
  "/documents": "Documents",
  "/community": "Community",
  "/history": "History",
  "/settings": "Settings",
  "/help": "Help",
};

export default function TopBar() {
  const location = useLocation();

  const title = useMemo(() => labels[location.pathname] ?? "AI Chat", [location.pathname]);

  return (
    <header className="flex items-center justify-between border-b border-[var(--line-subtle)] pb-4">
      <h2 className="text-lg font-semibold text-[var(--text-strong)]">{title}</h2>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 rounded-lg bg-[var(--layer-base)] px-3 py-2 text-sm font-medium text-[var(--text-strong)] transition hover:bg-[var(--layer-muted)]">
          <Zap className="h-4 w-4" />
          <span>Upgrade</span>
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--layer-muted)]">
          <HelpCircle className="h-5 w-5 text-[var(--text-muted)]" />
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--layer-muted)]">
          <MoreVertical className="h-5 w-5 text-[var(--text-muted)]" />
        </button>
      </div>
    </header>
  );
}
