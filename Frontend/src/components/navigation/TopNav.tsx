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
          role="switch"
          aria-checked={theme === "dark"}
          className={`theme-toggle${theme === "dark" ? " active" : ""}`}
          onClick={toggleTheme}
          aria-label="Toggle light and dark mode"
        >
          <span className="toggle-track">
            <span className="toggle-aurora" aria-hidden />
            <span className="thumb" aria-hidden />
          </span>
          <span className="sr-only">Switch theme</span>
        </button>
        <button type="button" className="icon-button avatar" aria-label="Profile" onClick={onProfile}>
          <span style={{ fontWeight: 700 }}>R</span>
        </button>
      </div>
    </header>
  );
};

export default TopNav;
