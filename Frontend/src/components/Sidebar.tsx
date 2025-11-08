import { NavLink } from "react-router-dom";
import {
  MessageSquare,
  Layers,
  FileText,
  BarChart3,
  History as HistoryIcon,
  Settings as Cog,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const item = "flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-white/5 transition-colors";
const active = "bg-white/10 text-white shadow-soft border border-white/10";

const links = [
  { to: "/chat", label: "Chat", Icon: MessageSquare },
  { to: "/sessions", label: "Sessions", Icon: Layers },
  { to: "/templates", label: "Templates", Icon: Sparkles },
  { to: "/documents", label: "Documents", Icon: FileText },
  { to: "/metrics", label: "Metrics", Icon: BarChart3 },
  { to: "/history", label: "History", Icon: HistoryIcon },
  { to: "/settings", label: "Settings", Icon: Cog },
];

type SidebarProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: (path: string) => void;
};

export function Sidebar({ variant = "desktop", onNavigate }: SidebarProps = {}) {
  const containerClass =
    variant === "mobile"
      ? "w-64 bg-[var(--nexus-surface)] border-r border-[var(--nexus-border)] flex flex-col py-6"
      : "fixed left-0 top-16 bottom-0 w-16 md:w-20 bg-[var(--nexus-surface)] border-r border-[var(--nexus-border)] flex flex-col items-center py-3";
  const navClass = variant === "mobile" ? "flex-1 flex flex-col gap-1 px-4" : "flex-1 w-full flex flex-col items-stretch gap-1 px-2";
  const labelClass = variant === "mobile" ? "inline" : "hidden md:inline";

  return (
    <aside className={containerClass}>
      <nav className={navClass}>
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${item} ${isActive ? active : "text-gray-300"}`}
            onClick={() => onNavigate?.(to)}
          >
            <Icon className="h-5 w-5" />
            <span className={labelClass}>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={variant === "mobile" ? "px-4 pb-6 mt-auto" : "w-full px-2 pb-3 mt-auto"}>
        <ThemeToggle />
      </div>
    </aside>
  );
}
