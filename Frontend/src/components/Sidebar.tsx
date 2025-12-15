import { NavLink } from "react-router-dom";

const primaryNav = [
  { label: "Home", to: "/home" },
  { label: "Toron", to: "/toron" },
  { label: "Workspace", to: "/workspace" },
  { label: "Settings", to: "/settings" },
];

const secondaryNav = [
  { label: "Sessions", to: "/toron" },
  { label: "Library", to: "/workspace" },
  { label: "Archive", to: "/workspace" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="brand">Ryuzen</div>

        <div className="nav-group">
          <div className="nav-label">Main</div>
          <nav className="nav" aria-label="Primary">
            {primaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="nav-group">
          <div className="nav-label">Secondary</div>
          <nav className="nav" aria-label="Secondary">
            {secondaryNav.map((item) => (
              <NavLink
                key={item.label + item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="upgrade-card">
          <div className="upgrade-label">Upgrade</div>
          <div className="upgrade-note">Access deeper context and faster Toron sessions.</div>
          <button type="button" className="secondary">Upgrade</button>
        </div>
      </div>
    </aside>
  );
}
