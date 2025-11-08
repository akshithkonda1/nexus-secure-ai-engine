import { NavLink } from "react-router-dom";
import {
  MessageCircle, Folder, Sparkles, FileText, BarChart3,
  History, Settings, Sun
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

type Item = { to: string; label: string; Icon: any };

const items: Item[] = [
  { to: "/chat",      label: "Chat",      Icon: MessageCircle },
  { to: "/sessions",  label: "Sessions",  Icon: Folder },
  { to: "/templates", label: "Templates", Icon: Sparkles },
  { to: "/docs",      label: "Documents", Icon: FileText },
  { to: "/metrics",   label: "Metrics",   Icon: BarChart3 },
  { to: "/history",   label: "History",   Icon: History },
  { to: "/settings",  label: "Settings",  Icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-64 z-30">
      <nav className="h-full flex flex-col">
        <div className="p-3 space-y-1">
          {items.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2 rounded-xl border",
                  "hover:bg-[var(--nexus-accent)]/10 hover:border-[var(--nexus-accent)]",
                  isActive ? "border-[var(--nexus-accent)] bg-[var(--nexus-accent)]/15 text-[var(--nexus-accent)]" : "border-[var(--nexus-border)]/50 opacity-90"
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </div>

        <div className="mt-auto p-3 border-t border-[var(--nexus-border)]/60">
          <ThemeToggle />
          <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
            <Sun className="h-3.5 w-3.5" />
            <span>Script-style polished theme</span>
          </div>
        </div>
      </nav>
    </aside>
  );
}
