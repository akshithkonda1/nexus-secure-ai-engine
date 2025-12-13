import { useTheme } from "../theme/ThemeProvider";

function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page">
      <div className="glass-panel hero">
        <div>
          <p className="section-body">Settings</p>
          <h1>Predictable and boring on purpose.</h1>
        </div>
        <p className="section-body">Theme, account, privacy, and preferences. Nothing more, nothing hidden.</p>
      </div>
      <div className="settings-grid">
        <div className="glass-panel settings-card">
          <h3>Theme</h3>
          <p>Light and dark share identical tokens. Toggle to switch.</p>
          <button className="pill-button" type="button" onClick={toggleTheme}>
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
        <div className="glass-panel settings-card">
          <h3>Account</h3>
          <p>Manage credentials without touching route state.</p>
          <label htmlFor="name">Display name</label>
          <input id="name" name="name" placeholder="Ryuzen user" />
          <small>Local only. Clears on navigation.</small>
        </div>
        <div className="glass-panel settings-card">
          <h3>Privacy</h3>
          <p>Visibility settings stay explicit.</p>
          <label htmlFor="visibility">Session visibility</label>
          <select id="visibility" name="visibility" defaultValue="private">
            <option value="private">Private</option>
            <option value="team">Team</option>
            <option value="org">Organization</option>
          </select>
        </div>
        <div className="glass-panel settings-card">
          <h3>Preferences</h3>
          <p>Operational defaults for Toron and Workspace.</p>
          <label htmlFor="notifications">Notifications</label>
          <select id="notifications" name="notifications" defaultValue="calm">
            <option value="calm">Calm</option>
            <option value="focused">Focused</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Settings;
