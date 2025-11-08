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
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-white/10 bg-elevated px-4 pb-8 pt-20 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] md:flex">
      {content}
    </aside>
  );
}
