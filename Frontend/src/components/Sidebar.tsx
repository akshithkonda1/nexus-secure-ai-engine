import React from "react";
import { NavLink } from "react-router-dom";
import { MessageCircle, Folder, FileText, History, Settings } from "lucide-react";

const navItems = [
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/templates", label: "Templates", icon: Folder },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-[rgb(var(--surface))] border-r border-[color:rgba(var(--border))] p-4">
      <h2 className="text-xl font-semibold mb-6">Nexus(Beta)</h2>
      <nav className="space-y-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                isActive
                  ? "bg-brand text-white shadow-[var(--elev-1)]"
                  : "text-[rgb(var(--text))] hover:bg-[rgb(var(--panel))]"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
