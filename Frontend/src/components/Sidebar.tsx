import { NavLink } from "react-router-dom";
import {
  MessageCircle,
  Folder,
  Sparkles,
  FileText,
  BarChart3,
  History,
  Settings as SettingsIcon,
  Home,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const navIcon = "h-5 w-5";
const baseItem =
  "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors";
const active =
  "bg-[var(--nexus-accent)]/15 text-[var(--nexus-text)] border border-[var(--nexus-accent)]/30";
const idle =
  "text-gray-400 hover:text-[var(--nexus-text)] hover:bg-white/5 border border-transparent";

type Item = { to: string; label: string; icon: JSX.Element };

const items: Item[] = [
  { to: "/", label: "Home", icon: <Home className={navIcon} aria-hidden /> },
  { to: "/chat", label: "Chat", icon: <MessageCircle className={navIcon} aria-hidden /> },
  { to: "/sessions", label: "Sessions", icon: <Folder className={navIcon} aria-hidden /> },
  { to: "/templates", label: "Templates", icon: <Sparkles className={navIcon} aria-hidden /> },
  { to: "/documents", label: "Documents", icon: <FileText className={navIcon} aria-hidden /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart3 className={navIcon} aria-hidden /> },
  { to: "/history", label: "History", icon: <History className={navIcon} aria-hidden /> },
  { to: "/settings", label: "Settings", icon: <SettingsIcon className={navIcon} aria-hidden /> },
];

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-14 bottom-0 w-64 overflow-y-auto px-3 py-4"
      style={{
        background:
          "linear-gradient(180deg, var(--nexus-surface), var(--nexus-bg))",
        borderRight: "1px solid var(--nexus-border)",
        boxShadow: "inset -1px 0 0 rgba(255,255,255,0.02)",
      }}
    >
      <nav className="space-y-1">
        {items.map((i) => (
          <NavLink
            key={i.to}
            to={i.to}
            end={i.to === "/"}
            className={({ isActive }) =>
              [baseItem, isActive ? active : idle].join(" ")
            }
          >
            {i.icon}
            <span>{i.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto fixed left-0 bottom-0 w-64 px-3 pb-4">
        <div className="border-t pt-3" style={{ borderColor: "var(--nexus-border)" }}>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
