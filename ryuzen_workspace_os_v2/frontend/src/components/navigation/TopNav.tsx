import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../state/theme";

interface TopNavProps {
  onProfile: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onProfile }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <Link to="/" className="brand" aria-label="Ryuzen home">
        <span className="brand-mark" />
        <div style={{ display: "grid", gap: 2 }}>
          <span style={{ letterSpacing: 0.4 }}>Ryuzen</span>
          <small style={{ color: "var(--text-muted)", fontWeight: 500 }}>Cosmic OS</small>
        </div>
      </Link>
      <div className="nav-actions">
        <button type="button" className="icon-button" aria-label="Notifications">
          🔔
        </button>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          aria-pressed={theme === "dark"}
        >
          <span className="thumb" />
        </button>
        <button type="button" className="icon-button avatar" aria-label="Profile" onClick={onProfile}>
          <span style={{ fontWeight: 700 }}>R</span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
