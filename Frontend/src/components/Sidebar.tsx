import { NavLink } from "react-router-dom";

const navigation = [
  { label: "Home", to: "/home" },
  { label: "Toron", to: "/toron" },
  { label: "Workspace", to: "/workspace" },
  { label: "Settings", to: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="brand">Ryuzen</div>
        <nav className="nav" aria-label="Primary">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="account">
          <div className="account-name">Account</div>
          <div className="account-meta">Signed in</div>
        </div>
      </div>
    </aside>
  );
}
