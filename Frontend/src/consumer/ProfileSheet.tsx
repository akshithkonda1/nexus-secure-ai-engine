import React, { useEffect, useMemo, useState } from "react";
import type { UserProfile } from "../state/profile";

export type ProfileSheetTab = "user" | "plan" | "feedback";

type ProfileSheetProps = {
  open: boolean;
  tab: ProfileSheetTab;
  onTabChange: (tab: ProfileSheetTab) => void;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onDeleteAccount: () => void;
  onUpgradePlan: () => void;
  onSubmitFeedback: (message: string) => void;
};

const navConfig: { key: ProfileSheetTab; label: string; subtitle: string }[] = [
  { key: "user", label: "Menu 1 · User Settings", subtitle: "Update your identity" },
  { key: "plan", label: "Menu 2 · Plan & Billing", subtitle: "Manage access" },
  { key: "feedback", label: "Menu 3 · System Feedback", subtitle: "Share improvements" },
];

const PROFILE_HINTS = [
  { label: "Workspace", value: "Nexus Zero-Trust" },
  { label: "Role", value: "Administrator" },
  { label: "Member since", value: "April 2024" },
];

const PLAN_FEATURES = [
  "Unlimited chat history",
  "Multi-model orchestration",
  "Security insights dashboard",
];

const ProfileSheet: React.FC<ProfileSheetProps> = ({
  open,
  tab,
  onTabChange,
  onClose,
  profile,
  onSaveProfile,
  onDeleteAccount,
  onUpgradePlan,
  onSubmitFeedback,
}) => {
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [status, setStatus] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(profile);
      setStatus(null);
      setFeedbackStatus(null);
    }
  }, [open, profile]);

  useEffect(() => {
    setStatus(null);
    setFeedbackStatus(null);
  }, [tab]);

  if (!open) {
    return null;
  }

  const initials = useMemo(() => {
    if (draft.avatarDataUrl) return "";
    const parts = (draft.displayName || "User").trim().split(/\s+/);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "NX";
  }, [draft.avatarDataUrl, draft.displayName]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setDraft((prev) => ({ ...prev, avatarDataUrl: result }));
        setStatus("Preview updated. Save to keep changes.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setDraft((prev) => ({ ...prev, avatarDataUrl: null }));
    setStatus("Avatar removed. Save to confirm.");
  };

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    onSaveProfile(draft);
    setStatus("Profile saved.");
  };

  const handleDelete = () => {
    if (window.confirm("Delete your Nexus account? This cannot be undone.")) {
      onDeleteAccount();
    }
  };

  const handleSendFeedback = () => {
    const message = feedback.trim();
    if (!message) {
      setFeedbackStatus("Add a bit more detail before sending.");
      return;
    }
    onSubmitFeedback(message);
    setFeedback("");
    setFeedbackStatus("Thanks! Your feedback has been recorded.");
  };

  return (
    <div className="profile-sheet-backdrop" role="dialog" aria-modal onClick={onClose}>
      <div className="profile-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="profile-sheet-head">
          <div>
            <h2>Account & Workspace</h2>
            <p>Configure your Nexus identity, billing and signal feedback.</p>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close profile settings">
            ✖
          </button>
        </div>
        <div className="profile-sheet-body">
          <nav className="profile-nav" aria-label="Profile sections">
            {navConfig.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`profile-nav-btn ${tab === item.key ? "on" : ""}`}
                onClick={() => onTabChange(item.key)}
              >
                <span>{item.label}</span>
                <small>{item.subtitle}</small>
              </button>
            ))}
          </nav>
          <div className="profile-content">
            {tab === "user" && (
              <form className="profile-form" onSubmit={handleSaveProfile}>
                <div className="profile-row">
                  <div className="profile-avatar-large" aria-hidden>
                    {draft.avatarDataUrl ? (
                      <img src={draft.avatarDataUrl} alt="Profile avatar preview" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="profile-avatar-actions">
                    <label className="profile-upload">
                      <input type="file" accept="image/*" onChange={handleFileChange} />
                      <span>Upload new photo</span>
                    </label>
                    {draft.avatarDataUrl && (
                      <button type="button" className="link-btn" onClick={handleRemoveAvatar}>
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                <label className="profile-field">
                  <span>Display name</span>
                  <input
                    value={draft.displayName}
                    onChange={(event) => setDraft((prev) => ({ ...prev, displayName: event.target.value }))}
                  />
                </label>
                <label className="profile-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </label>

                <div className="profile-hints">
                  {PROFILE_HINTS.map((item) => (
                    <div key={item.label}>
                      <span className="hint-label">{item.label}</span>
                      <span className="hint-value">{item.value}</span>
                    </div>
                  ))}
                </div>

                {status && <p className="muted small">{status}</p>}

                <div className="profile-actions">
                  <button type="button" className="danger-btn" onClick={handleDelete}>
                    Delete account
                  </button>
                  <button type="submit" className="primary-btn">
                    Save changes
                  </button>
                </div>
              </form>
            )}

            {tab === "plan" && (
              <div className="plan-card">
                <div>
                  <h3>Current plan: Free</h3>
                  <p className="muted">
                    Enjoy orchestrated insights across Nexus models while we finish premium plans.
                  </p>
                  <ul>
                    {PLAN_FEATURES.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="plan-footer">
                  <div>
                    <span className="hint-label">Usage this month</span>
                    <span className="hint-value">2,800 orchestrations</span>
                  </div>
                  <button type="button" className="primary-btn" onClick={onUpgradePlan}>
                    Upgrade plan
                  </button>
                </div>
              </div>
            )}

            {tab === "feedback" && (
              <div className="feedback-card">
                <label className="profile-field">
                  <span>System feedback</span>
                  <textarea
                    rows={6}
                    placeholder="Share ideas, bugs, or improvements for the Nexus Engine."
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                  />
                </label>
                <div className="profile-actions end">
                  <button type="button" className="primary-btn" onClick={handleSendFeedback}>
                    Send feedback
                  </button>
                </div>
                {feedbackStatus && <p className="muted small">{feedbackStatus}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSheet;
