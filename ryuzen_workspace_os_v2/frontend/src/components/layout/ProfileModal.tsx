import React from "react";
import { useTheme } from "../../state/theme";

interface ProfileModalProps {
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel glass-panel">
        <button type="button" className="close-button" aria-label="Close profile" onClick={onClose}>
          ✕
        </button>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Profile</h2>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 18 }}>
          <div
            className="avatar"
            style={{ width: 96, height: 96, borderRadius: 24, display: "grid", placeItems: "center", fontWeight: 700 }}
          >
            RZ
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Account</div>
              <div style={{ color: "var(--text-secondary)" }}>ryuzen.lead@cosmos.ai</div>
            </div>
            <label style={{ display: "grid", gap: 8 }}>
              <span style={{ fontWeight: 600 }}>About</span>
              <textarea
                maxLength={15000}
                rows={4}
                defaultValue="Designing the calmest frontier systems with Ryuzen."
                style={{
                  width: "100%",
                  borderRadius: 14,
                  border: "1px solid var(--border-strong)",
                  background: "var(--bg-surface)",
                  padding: 12,
                  color: "var(--text-primary)",
                }}
              />
            </label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Theme</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="pill-button secondary"
                  onClick={() => setTheme("light")}
                  aria-pressed={theme === "light"}
                >
                  Light
                </button>
                <button
                  type="button"
                  className="pill-button secondary"
                  onClick={() => setTheme("dark")}
                  aria-pressed={theme === "dark"}
                >
                  Dark
                </button>
              </div>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Preferences</div>
              <div style={{ color: "var(--text-secondary)" }}>Minimal notifications • Ambient AI controls • Session sync</div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="pill-button">
                Logout
              </button>
              <button type="button" className="pill-button secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
