import React from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/workspace/lists", label: "Lists" },
  { to: "/workspace/calendar", label: "Calendar" },
  { to: "/workspace/tasks", label: "Tasks" },
  { to: "/workspace/connectors", label: "Connectors" },
  { to: "/workspace/pages", label: "Pages" },
  { to: "/workspace/notes", label: "Notes" },
  { to: "/workspace/boards", label: "Boards" },
  { to: "/workspace/flows", label: "Flows" },
  { to: "/workspace/toron", label: "Toron" },
];

const SideNav: React.FC = () => (
  <aside className="side-nav">
    {navItems.map((item) => (
      <NavLink key={item.to} to={item.to} className="side-nav-link">
        {item.label}
      </NavLink>
    ))}
  </aside>
);

export default SideNav;
