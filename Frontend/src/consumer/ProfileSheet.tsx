import React, { useEffect, useMemo, useRef, useState } from "react";
import type { UserProfile } from "../state/profile";

export type ProfileSheetTab = "user" | "plan" | "feedback";

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

type StatusTone = "info" | "success" | "error";

type StatusMessage = {
  tone: StatusTone;
  text: string;
};

const TAB_META: Record<ProfileSheetTab, { heading: string; subheading: string }> = {
  user: { heading: "User Settings", subheading: "Update your Nexus identity" },
  plan: { heading: "Plan & Billing", subheading: "Stay informed about upgrades" },
  feedback: { heading: "System Feedback", subheading: "Tell us how we can improve" },
};

const FEEDBACK_OPTIONS = [
  "Feature Request",
  "System Glitch and Bug",
  "Incorrect Result",
  "Other",
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
  const [profileStatus, setProfileStatus] = useState<StatusMessage | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<StatusMessage | null>(null);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState(FEEDBACK_OPTIONS[0]);
  const [feedback, setFeedback] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<StatusMessage | null>(null);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const planAlertShownRef = useRef(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setDraft(profile);
    setProfileStatus(null);
    setPasswordStatus(null);
    setPasswords({ current: "", next: "", confirm: "" });
    setFeedbackSubject("");
    setFeedbackCategory(FEEDBACK_OPTIONS[0]);
    setFeedback("");
    setFeedbackStatus(null);
    setShowAvatarPreview(false);
    planAlertShownRef.current = false;
  }, [open, profile]);

  useEffect(() => {
    if (!open) {
      return;
    }
    if (tab === "plan" && !planAlertShownRef.current) {
      onUpgradePlan();
      planAlertShownRef.current = true;
    }
    if (tab !== "plan") {
      planAlertShownRef.current = false;
    }
    if (tab !== "feedback") {
      setFeedbackStatus(null);
    }
  }, [open, tab, onUpgradePlan]);

  if (!open) {
    return null;
  }

  const initials = useMemo(() => {
    if (draft.avatarDataUrl) return "";
    const parts = (draft.displayName || "User").trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "NX";
  }, [draft.avatarDataUrl, draft.displayName]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setDraft((prev) => ({ ...prev, avatarDataUrl: result }));
        setProfileStatus({ tone: "info", text: "Preview updated. Save to keep changes." });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setDraft((prev) => ({ ...prev, avatarDataUrl: null }));
    setProfileStatus({ tone: "info", text: "Avatar removed. Save to confirm." });
  };

  const handleSaveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    const displayName = draft.displayName.trim();
    const email = draft.email.trim();
    if (!displayName || !email) {
      setProfileStatus({ tone: "error", text: "Enter a display name and email before saving." });
      return;
    }
    const nextProfile: UserProfile = { ...draft, displayName, email };
    setDraft(nextProfile);
    onSaveProfile(nextProfile);
    setProfileStatus({ tone: "success", text: "Profile changes saved." });

    if (passwords.current || passwords.next || passwords.confirm) {
      if (!passwords.current || !passwords.next || !passwords.confirm) {
        setPasswordStatus({
          tone: "error",
          text: "Complete all password fields to update your password.",
        });
        return;
      }
      if (passwords.next !== passwords.confirm) {
        setPasswordStatus({
          tone: "error",
          text: "New password and confirmation must match.",
        });
        return;
      }
      onChangePassword({ current: passwords.current, next: passwords.next });
      setPasswords({ current: "", next: "", confirm: "" });
      setPasswordStatus({ tone: "success", text: "Password updated successfully." });
    } else {
      setPasswordStatus(null);
    }
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
      setFeedbackStatus({
        tone: "error",
        text: "Add a subject so we can route your feedback.",
      });
      return;
    }
    if (!message) {
      setFeedbackStatus({
        tone: "error",
        text: "Describe the issue in detail before sending.",
      });
      return;
    }
    onSubmitFeedback({ subject, category: feedbackCategory, message });
    setFeedback("");
    setFeedbackSubject("");
    setFeedbackCategory(FEEDBACK_OPTIONS[0]);
    setFeedbackStatus({ tone: "success", text: "Thanks! Your feedback has been recorded." });
  };

  const statusClassName = (status: StatusMessage) => {
    if (status.tone === "error") {
      return "small error";
    }
    if (status.tone === "success") {
      return "small success";
    }
    return "muted small";
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
                  onChange={(event) => {
                    const value = event.target.value;
                    setDraft((prev) => ({ ...prev, displayName: value }));
                    setProfileStatus(null);
                  }}
                />
              </label>
              <label className="profile-field">
                <span>Email</span>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) => {
                    const value = event.target.value;
                    setDraft((prev) => ({ ...prev, email: value }));
                    setProfileStatus(null);
                  }}
                />
              </label>

              <div className="profile-password">
                <h3>Update password</h3>
                <p className="muted small">Leave blank to keep your current password.</p>
                <label className="profile-field">
                  <span>Current password</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={passwords.current}
                    onChange={(event) => {
                      const value = event.target.value;
                      setPasswords((prev) => ({ ...prev, current: value }));
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
                      const value = event.target.value;
                      setPasswords((prev) => ({ ...prev, next: value }));
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
                      const value = event.target.value;
                      setPasswords((prev) => ({ ...prev, confirm: value }));
                      setPasswordStatus(null);
                    }}
                  />
                </label>
              </div>

              {profileStatus && <p className={statusClassName(profileStatus)}>{profileStatus.text}</p>}
              {passwordStatus && <p className={statusClassName(passwordStatus)}>{passwordStatus.text}</p>}

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
              <h3>Plan & Billing</h3>
              <p className="muted">
                For now Nexus is free to use. We will let you know when billing and our plans become available.
              </p>
              <button type="button" className="primary-btn" onClick={onClose}>
                Close
              </button>
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
                    {FEEDBACK_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="profile-field">
                <span>Describe the issue in detail</span>
                <textarea
                  rows={7}
                  maxLength={15000}
                  placeholder="Describe the issue in detail. Be detailed and let us know what we can do."
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
              {feedbackStatus && <p className={statusClassName(feedbackStatus)}>{feedbackStatus.text}</p>}
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
