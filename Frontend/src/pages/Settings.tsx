import React from "react";
import { useTheme } from "../state/theme";

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="glass-panel" style={{ padding: 20, display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Settings</h2>
      <div className="settings-grid">
        <div className="stub-card">
          <div style={{ fontWeight: 700 }}>Theme</div>
          <div style={{ color: "var(--text-secondary)" }}>Light / Dark</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="pill-button secondary" onClick={() => setTheme("light")} aria-pressed={theme === "light"}>
              Light
            </button>
            <button type="button" className="pill-button secondary" onClick={() => setTheme("dark")} aria-pressed={theme === "dark"}>
              Dark
            </button>
          </div>
        </div>
        <div className="stub-card">
          <div style={{ fontWeight: 700 }}>Account</div>
          <div style={{ color: "var(--text-secondary)" }}>ryuzen.lead@cosmos.ai</div>
          <button type="button" className="pill-button secondary">Manage</button>
        </div>
        <div className="stub-card">
          <div style={{ fontWeight: 700 }}>Privacy</div>
          <div style={{ color: "var(--text-secondary)" }}>Data lineage and evidence logging are on.</div>
          <button type="button" className="pill-button secondary">Review controls</button>
        </div>
        <div className="stub-card">
          <div style={{ fontWeight: 700 }}>Preferences</div>
          <div style={{ color: "var(--text-secondary)" }}>Calm notifications • Minimal prompts • Boring by design</div>
          <button type="button" className="pill-button secondary">Open preferences</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
