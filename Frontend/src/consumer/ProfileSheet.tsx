import React, { useEffect, useMemo, useRef, useState } from "react";
import type { UserProfile } from "../state/profile";

export type ProfileSheetTab = "user" | "security" | "plan" | "feedback";

type ProfileSheetProps = {
  open: boolean;
  tab: ProfileSheetTab;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onChangePassword: (payload: { current: string; next: string }) => void;
  onDeleteAccount: () => void;
  onUpgradePlan: () => void;
  onSubmitFeedback: (feedback: { subject: string; category: string; message: string }) => void;
};

const TAB_META: Record<ProfileSheetTab, { heading: string; subheading: string }> = {
  user: { heading: "User Settings", subheading: "Update your Nexus identity" },
  security: { heading: "Account Security", subheading: "Keep your credentials protected" },
  plan: { heading: "Plan & Billing", subheading: "Stay informed about upgrades" },
  feedback: { heading: "System Feedback", subheading: "Tell us how we can improve" },
};

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
  onClose,
  profile,
  onSaveProfile,
  onChangePassword,
  onDeleteAccount,
  onUpgradePlan,
  onSubmitFeedback,
}) => {
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [status, setStatus] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("Feature Request");
  const [feedback, setFeedback] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const planAlertShownRef = useRef(false);

  useEffect(() => {
    if (open) {
      setDraft(profile);
      setStatus(null);
      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordStatus(null);
      setFeedbackSubject("");
      setFeedbackCategory("Feature Request");
      setFeedbackStatus(null);
      setFeedback("");
      planAlertShownRef.current = false;
      setShowAvatarPreview(false);
    }
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    setStatus(null);
    setPasswordStatus(null);
    setFeedbackStatus(null);
    if (tab === "plan" && !planAlertShownRef.current) {
      alert("For now Nexus is free to use. We will let you know when billing and our plans become available.");
      planAlertShownRef.current = true;
    }
    if (tab !== "plan") {
      planAlertShownRef.current = false;
    }
  }, [open, tab]);

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
    const nextProfile: UserProfile = { ...draft, bio: draft.bio ?? "" };
    setDraft(nextProfile);
    onSaveProfile(nextProfile);
    setStatus("Profile saved.");
  };

  const handleSavePassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      setPasswordStatus("Fill out your current, new, and confirmation password to update your credentials.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordStatus("New password and confirmation need to match.");
      return;
    }
    onChangePassword({ current: passwords.current, next: passwords.next });
    setPasswords({ current: "", next: "", confirm: "" });
    setPasswordStatus("Password updated successfully.");
  };

  const handleDelete = () => {
    if (window.confirm("Delete your Nexus account? This cannot be undone.")) {
      onDeleteAccount();
    }
  };

  const handleSendFeedback = () => {
    const subject = feedbackSubject.trim();
    const message = feedback.trim();
    if (!subject) {
      setFeedbackStatus("Add a subject so we can route your feedback.");
      return;
    }
    if (!message) {
      setFeedbackStatus("Describe the issue in detail before sending.");
      return;
    }
    onSubmitFeedback({ subject, category: feedbackCategory, message });
    setFeedback("");
    setFeedbackSubject("");
    setFeedbackCategory("Feature Request");
    setFeedbackStatus("Thanks! Your feedback has been recorded.");
  };

  return (
    <div className="profile-sheet-backdrop" role="dialog" aria-modal onClick={onClose}>
      <div className="profile-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="profile-sheet-head">
          <div>
            <h2>{TAB_META[tab].heading}</h2>
            <p>{TAB_META[tab].subheading}</p>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close profile settings">
            ✖
          </button>
        </div>
        <div className="profile-sheet-body">
          {tab === "user" && (
            <form className="profile-form" onSubmit={handleSaveProfile}>
              <div className="profile-row">
                <div className="profile-avatar-large">
                  {draft.avatarDataUrl ? (
                    <button
                      type="button"
                      className="avatar-preview-trigger"
                      onClick={() => setShowAvatarPreview(true)}
                      aria-label="View profile photo in full size"
                      title="View profile photo"
                    >
                      <img src={draft.avatarDataUrl} alt="Profile avatar preview" />
                    </button>
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

                <label className="profile-field">
                  <span>Workspace bio</span>
                  <textarea
                    rows={3}
                    placeholder="Tell teammates how you partner with Nexus."
                    value={draft.bio}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        bio: event.target.value,
                      }))
                    }
                  />
                  <small className="muted">Share a short note that appears in collaboration spaces.</small>
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

          {tab === "security" && (
            <form className="profile-form" onSubmit={handleSavePassword}>
              <div className="profile-security-intro">
                <h3>Change password</h3>
                <p className="muted small">
                  Update your Nexus credentials. Passwords must be at least 12 characters and include a mix of symbols.
                </p>
              </div>
                <label className="profile-field">
                  <span>Current password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={passwords.current}
                    onChange={(event) => {
                      setPasswords((prev) => ({
                        ...prev,
                        current: event.target.value,
                      }));
                      setPasswordStatus(null);
                    }}
                  />
                </label>
                <label className="profile-field">
                  <span>New password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwords.next}
                    onChange={(event) => {
                      setPasswords((prev) => ({
                        ...prev,
                        next: event.target.value,
                      }));
                      setPasswordStatus(null);
                    }}
                  />
                </label>
                <label className="profile-field">
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwords.confirm}
                    onChange={(event) => {
                      setPasswords((prev) => ({
                        ...prev,
                        confirm: event.target.value,
                      }));
                      setPasswordStatus(null);
                    }}
                  />
                </label>

              {passwordStatus && (
                <p className={`small ${passwordStatus.includes("successfully") ? "success" : "error"}`}>{passwordStatus}</p>
              )}

              <div className="profile-actions end">
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
                  For now Nexus is free to use. We will let you know when billing and our plans become available.
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
              <div className="feedback-grid">
                <label className="profile-field">
                  <span>Subject</span>
                  <input
                    type="text"
                    placeholder="Give your feedback a headline"
                    value={feedbackSubject}
                    onChange={(event) => {
                      setFeedbackSubject(event.target.value);
                      setFeedbackStatus(null);
                    }}
                  />
                </label>
                <label className="profile-field">
                  <span>Feedback type</span>
                  <select
                    value={feedbackCategory}
                    onChange={(event) => {
                      setFeedbackCategory(event.target.value);
                      setFeedbackStatus(null);
                    }}
                  >
                    <option value="Feature Request">Feature Request</option>
                    <option value="System Glitch and Bug">System Glitch and Bug</option>
                    <option value="Incorrect Result">Incorrect Result</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>
              <label className="profile-field">
                <span>Details</span>
                <textarea
                  rows={7}
                  maxLength={15000}
                  placeholder="Describe the issue in detail. Be detailed and let us know what we can improve."
                  value={feedback}
                  onChange={(event) => {
                    setFeedback(event.target.value);
                    setFeedbackStatus(null);
                  }}
                />
                <small className="muted">{feedback.length.toLocaleString()} / 15,000 characters</small>
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
      {showAvatarPreview && draft.avatarDataUrl && (
        <div
          className="avatar-preview-backdrop"
          role="dialog"
          aria-modal
          aria-label="Profile photo preview"
          onClick={() => setShowAvatarPreview(false)}
        >
          <div className="avatar-preview" onClick={(event) => event.stopPropagation()}>
            <img src={draft.avatarDataUrl} alt="Profile avatar enlarged preview" />
            <button type="button" className="icon-btn" onClick={() => setShowAvatarPreview(false)} aria-label="Close preview">
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSheet;
