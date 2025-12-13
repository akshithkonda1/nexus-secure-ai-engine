import React from "react";
import { NavLink } from "react-router-dom";
import {
  Clock,
  FileText,
  Folder,
  Home,
  LayoutGrid,
  MessageCircle,
  Settings,
  Sparkles,
} from "lucide-react";

interface SideNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/toron", label: "Toron", icon: Sparkles },
  { to: "/workspace", label: "Workspace", icon: LayoutGrid },
  { to: "/projects", label: "Projects", icon: Folder },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/history", label: "History", icon: Clock },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/feedback", label: "Feedback", icon: MessageCircle },
];

const SideNav: React.FC<SideNavProps> = ({ collapsed, onToggle }) => {
  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`} data-collapsed={collapsed} aria-label="Primary navigation">
      <button
        type="button"
        className="collapse-toggle"
        onClick={onToggle}
        aria-label={`${collapsed ? "Expand" : "Collapse"} sidebar`}
        aria-pressed={!collapsed}
      >
        {collapsed ? "›" : "‹"}
      </button>
      <ul className="nav-list">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              end={to === "/"}
              aria-label={collapsed ? label : undefined}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} strokeWidth={1.8} aria-hidden />
              <span className="nav-label">{label}</span>
              {collapsed && <span className="tooltip">{label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SideNav;
