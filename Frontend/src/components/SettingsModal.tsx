import React, { useEffect, useState } from "react";
import { getApiKey, setApiKey, setTheme } from "../state/session";

type SettingsModalProps = { open: boolean; onClose: () => void };

type ThemeOption = "light" | "dark";

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [key, setKey] = useState(getApiKey());
  const [theme, setThemeState] = useState<ThemeOption>("dark");

  useEffect(() => {
    const stored = (localStorage.getItem("theme") as ThemeOption) || "dark";
    setThemeState(stored);
  }, []);

  function save() {
    setApiKey(key);
    setTheme(theme);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h3>Settings</h3>
        <label>API Key (X-API-Key)</label>
        <input value={key} onChange={(event) => setKey(event.target.value)} placeholder="paste your key" />

        <label>Theme</label>
        <select value={theme} onChange={(event) => setThemeState(event.target.value as ThemeOption)}>
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>

        <div className="row">
          <button onClick={save}>Save</button>
          <button className="ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
        <div className="fineprint">Secured by Nexus</div>
      </div>
    </div>
  );
}
