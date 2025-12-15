import { NavLink } from "react-router-dom";

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
  { label: "Riset", to: "/workspace" },
  { label: "Image", to: "/workspace" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand"> <Ryuzen></Ryuzen></div>

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
          {workspaceNav.map((item, index) => (
            <NavLink
              key={item.label + item.to + index}
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
        <div className="upgrade-note">
          Boost productivity with seamless automation and responsive AI, built to adapt to your needs.
        </div>
        <button type="button" className="secondary full">
          Upgrade
        </button>
      </div>
    </aside>
  );
}
