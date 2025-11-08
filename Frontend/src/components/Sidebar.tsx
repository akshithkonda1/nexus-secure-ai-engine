import { useMemo } from "react";
import {
  MessageCircle,
  Folder,
  Sparkles,
  FileText,
  BarChart3,
  History,
  Settings as SettingsIcon,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

type SidebarProps = {
  onNavigate?: (path: string) => void;
  active?: string;
};

type NavItem = {
  label: string;
  to: string;
  icon: JSX.Element;
};

export function Sidebar({ onNavigate, active = "/home" }: SidebarProps) {
  const items = useMemo<NavItem[]>(
    () => [
      { label: "Chat", to: "/chat", icon: <MessageCircle className="h-5 w-5" /> },
      { label: "Sessions", to: "/sessions", icon: <Folder className="h-5 w-5" /> },
      { label: "Templates", to: "/templates", icon: <Sparkles className="h-5 w-5" /> },
      { label: "Documents", to: "/docs", icon: <FileText className="h-5 w-5" /> },
      { label: "Telemetry", to: "/metrics", icon: <BarChart3 className="h-5 w-5" /> },
      { label: "History", to: "/history", icon: <History className="h-5 w-5" /> },
      { label: "Settings", to: "/settings", icon: <SettingsIcon className="h-5 w-5" /> },
    ],
    []
  );

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 pt-4 border-r border-[color:var(--nexus-border)] overflow-y-auto">
      <nav className="px-3 space-y-1">
        {items.map((i) => {
          const isActive = active === i.to;
          return (
            <button
              key={i.to}
              onClick={() => onNavigate?.(i.to)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                ${isActive ? "bg-[color:var(--nexus-accent)]/15 text-white" : "text-gray-400 hover:bg-white/5"}`}
            >
              {i.icon}
              <span className="text-sm">{i.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-[color:var(--nexus-border)] mt-4">
        <ThemeToggle />
      </div>
    </aside>
  );
}
