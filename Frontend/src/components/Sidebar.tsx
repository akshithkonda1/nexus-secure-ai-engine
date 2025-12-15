import { NavLink } from "react-router-dom";

const primaryNav = [
  { label: "Home", to: "/home" },
  { label: "Toron", to: "/toron" },
  { label: "Workspace", to: "/workspace" },
  { label: "Settings", to: "/settings" },
];

const featureNav = [
  { label: "New Chat", to: "/toron" },
  { label: "Chat", to: "/toron" },
  { label: "Archived", to: "/workspace" },
  { label: "Library", to: "/workspace" },
];

const workspaceNav = [
  { label: "New Project", to: "/workspace" },
  { label: "Image", to: "/workspace" },
  { label: "Presentation", to: "/workspace" },
  { label: "Research", to: "/workspace" },
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
          <div className="nav-label">Features</div>
          <nav className="nav" aria-label="Features">
            {featureNav.map((item) => (
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

        <div className="nav-group">
          <div className="nav-label">Workspaces</div>
          <nav className="nav" aria-label="Workspaces">
            {workspaceNav.map((item) => (
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
          <div className="upgrade-label">Upgrade to premium</div>
          <div className="upgrade-note">Unlock faster models and richer sessions.</div>
          <button type="button" className="secondary">Upgrade</button>
        </div>
      </div>
    </aside>
  );
}
