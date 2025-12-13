import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import ProfileMenu from "./ProfileMenu";
import ThemeToggle from "./ThemeToggle";

type NavItem = {
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Toron", path: "/toron" },
  { label: "Workspace", path: "/workspace" },
  { label: "Projects", path: "/projects" },
  { label: "Documents", path: "/documents" },
  { label: "History", path: "/history" },
  { label: "Settings", path: "/settings" },
];

function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const active = useMemo(
    () => navItems.find((item) => pathname === item.path)?.path ?? "/",
    [pathname]
  );

  return (
    <header className="header">
      <div className="header-inner">
        <button className="brand" onClick={() => navigate("/")}>
          <span className="brand-mark" aria-hidden="true" />
          <span>Ryuzen</span>
        </button>
        <nav className="nav" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
              aria-current={active === item.path ? "page" : undefined}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="profile">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <ProfileMenu open={menuOpen} onToggle={() => setMenuOpen((prev) => !prev)} />
        </div>
      </div>
    </header>
  );
}

export default Header;
