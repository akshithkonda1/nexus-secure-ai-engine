import React from "react";
import { NavLink } from "react-router-dom";

interface SideNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/toron", label: "Toron", icon: "🪐" },
  { to: "/workspace", label: "Workspace", icon: "🧭" },
  { to: "/projects", label: "Projects", icon: "📁" },
  { to: "/documents", label: "Documents", icon: "📄" },
  { to: "/history", label: "History", icon: "⏳" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
  { to: "/feedback", label: "Feedback", icon: "💬" },
];

const SideNav: React.FC<SideNavProps> = ({ collapsed, onToggle }) => {
  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      <button type="button" className="collapse-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        {collapsed ? "›" : "‹"}
      </button>
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              end={item.to === "/"}
            >
              <span aria-hidden>{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {collapsed && <span className="tooltip">{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default SideNav;
