import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  deleteAccount,
  type Profile,
} from "../api/profile";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Tab = "profile" | "billing" | "feedback";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 8;
const FEEDBACK_KEY = "nexus.profile.feedback";

export default function ProfileModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const [initial, setInitial] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempPreview, setTempPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("profile");
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNote(null);
    setTab("profile");
    setFeedback("");
    setFeedbackError(null);
    setFeedbackStatus(null);
    (async () => {
      const p = await fetchProfile();
      setInitial(p);
      setDisplayName(p.displayName);
      setEmail(p.email);
      setAvatarUrl(p.avatarUrl);
      setTempFile(null);
      setTempPreview(null);
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dirty = useMemo(() => {
    if (!initial) return false;
    if (displayName !== initial.displayName) return true;
    if (tempFile !== null) return true;
    if (avatarUrl !== initial.avatarUrl) return true;
    return false;
  }, [initial, displayName, tempFile, avatarUrl]);

  if (!open) return null;

  function onSelectTab(next: Tab) {
    setTab(next);
    if (next !== "profile") {
      setError(null);
      setNote(null);
    }
    if (next !== "feedback") {
      setFeedbackError(null);
      setFeedbackStatus(null);
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPT.includes(f.type)) {
      setError("Please choose a PNG, JPG, WEBP or GIF image.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Image is too large. Max ${MAX_MB} MB.`);
      return;
    }
    setError(null);
    setTempFile(f);
    const reader = new FileReader();
    reader.onload = () => setTempPreview(String(reader.result));
    reader.readAsDataURL(f);
    setNote("Photo ready. Save to keep your new avatar.");
  }

  function onRemovePhoto() {
    if (tempFile || tempPreview) {
      setTempFile(null);
      setTempPreview(null);
    }
    setAvatarUrl(null);
    setNote("Photo will be removed when you save.");
  }

  async function onSave() {
    try {
      if (!initial) return;
      setSaving(true);
      setError(null);
      setNote(null);

      let avatar: string | null = avatarUrl;

      if (tempFile) {
        const { url } = await uploadAvatar(tempFile);
        avatar = url;
      }

      if (!avatar && initial.avatarUrl) {
        await removeAvatar();
      }

      const next = await updateProfile({
        displayName,
        avatarUrl: avatar,
      });

      setInitial(next);
      setAvatarUrl(next.avatarUrl);
      setTempFile(null);
      setTempPreview(null);
      setNote("Saved.");
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmDelete() {
    const yes = window.confirm("Delete account? This cannot be undone.");
    if (!yes) return;
    try {
      setDeleting(true);
      await deleteAccount();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  }

  function onCancel() {
    if (initial) {
      setDisplayName(initial.displayName);
      setAvatarUrl(initial.avatarUrl);
      setTempFile(null);
      setTempPreview(null);
      setNote(null);
    }
    setFeedback("");
    setFeedbackError(null);
    setFeedbackStatus(null);
    setTab("profile");
    onClose();
  }

  const previewSrc = tempPreview ?? avatarUrl ?? undefined;

  async function onSubmitFeedback() {
    const message = feedback.trim();
    if (!message) {
      setFeedbackError("Add a few words so we can understand your feedback.");
      return;
    }
    try {
      setSubmittingFeedback(true);
      setFeedbackError(null);
      const stored = localStorage.getItem(FEEDBACK_KEY);
      const parsed: Array<{ id: string; message: string; createdAt: string }> = stored
        ? JSON.parse(stored)
        : [];
      parsed.push({
        id: String(Date.now()),
        message,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(parsed));
      setFeedback("");
      setFeedbackStatus("Thanks! Your feedback has been sent.");
    } catch (err: any) {
      console.error("Failed to store feedback", err);
      setFeedbackError(err?.message ?? "We couldn't send your feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  }

  const title =
    tab === "profile"
      ? "Profile"
      : tab === "billing"
      ? "Plan & Billing"
      : "System Feedback";

  return (
    <div
      className="modal-backdrop"
      onClick={onCancel}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560,
          maxWidth: "calc(100vw - 32px)",
          borderRadius: 12,
          background: "#16161c",
          color: "#e5e7eb",
          padding: 20,
          boxShadow: "0 10px 40px rgba(0,0,0,.6)",
        }}
      >
        <header style={{ display: "flex", justifyContent: "space-between" }}>
          <h2 id="profile-title" style={{ fontSize: 22, margin: 0 }}>
            {title}
          </h2>
          <button onClick={onCancel} aria-label="Close" style={btnGhost} type="button">
            ✕
          </button>
        </header>

        <nav
          role="tablist"
          aria-label="Profile sections"
          style={{ display: "flex", gap: 8, marginTop: 16 }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "profile"}
            onClick={() => onSelectTab("profile")}
            style={tab === "profile" ? chipActiveButton : chipButton}
          >
            Profile
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "billing"}
            onClick={() => onSelectTab("billing")}
            style={tab === "billing" ? chipActiveButton : chipButton}
          >
            Plan &amp; Billing
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "feedback"}
            onClick={() => onSelectTab("feedback")}
            style={tab === "feedback" ? chipActiveButton : chipButton}
          >
            System Feedback
          </button>
        </nav>

        <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
          {tab === "profile" && (
            <>
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "#0f0f14",
                      overflow: "hidden",
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid rgba(255,255,255,.08)",
                    }}
                    aria-label="Profile photo"
                  >
                    {previewSrc ? (
                      <img
                        src={previewSrc}
                        alt="Avatar preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontWeight: 700 }}>
                        {(displayName || initial?.displayName || "N").slice(0, 2)}
                      </span>
                    )}
                  </div>

                  <label style={{ ...btn }}>
                    Choose File
                    <input
                      type="file"
                      accept={ACCEPT.join(",")}
                      style={{ display: "none" }}
                      onChange={onPickFile}
                    />
                  </label>

                  {(tempFile || avatarUrl) && (
                    <button onClick={onRemovePhoto} style={btnGhost} type="button">
                      Remove photo
                    </button>
                  )}
                </div>
                <div aria-live="polite" style={{ marginTop: 8, fontSize: 13, color: "#a3a3a3" }}>
                  {note}
                </div>
              </section>

              <section>
                <label style={label} htmlFor="profile-display-name">
                  Display name
                </label>
                <input
                  id="profile-display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={80}
                  placeholder="Your name"
                  style={input}
                />
              </section>

              <section>
                <label style={label} htmlFor="profile-email">
                  Email
                </label>
                <input id="profile-email" value={email} readOnly style={{ ...input, opacity: 0.8 }} />
              </section>

              {error && (
                <div
                  role="alert"
                  style={{
                    background: "#3b0d0d",
                    border: "1px solid #7f1d1d",
                    color: "#fecaca",
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  {error}
                </div>
              )}
            </>
          )}

          {tab === "billing" && (
            <section
              style={{
                background: "#0f0f14",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.08)",
                padding: 16,
                display: "grid",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 600 }}>Plan &amp; Billing</div>
              <p style={{ margin: 0, fontSize: 14, color: "#cbd5e1", lineHeight: 1.5 }}>
                You&apos;re exploring Nexus on a preview workspace. Billing integrations are disabled in
                this environment.
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
                Want to share what you&apos;d like to see in paid plans?
              </p>
              <button
                type="button"
                style={{ ...btnPrimary, width: "fit-content" }}
                onClick={() => onSelectTab("feedback")}
              >
                Send us upgrade ideas
              </button>
            </section>
          )}

          {tab === "feedback" && (
            <section style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={label} htmlFor="system-feedback">
                  Share your feedback
                </label>
                <textarea
                  id="system-feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  style={{
                    ...input,
                    resize: "vertical",
                    minHeight: 120,
                    fontFamily: "inherit",
                  }}
                  placeholder="Tell us how we can make Nexus better"
                />
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                  {feedback.length}/1000 characters
                </div>
              </div>
              {feedbackError && (
                <div
                  role="alert"
                  style={{
                    background: "#3b0d0d",
                    border: "1px solid #7f1d1d",
                    color: "#fecaca",
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  {feedbackError}
                </div>
              )}
              {feedbackStatus && (
                <div
                  role="status"
                  style={{
                    background: "rgba(34,197,94,.08)",
                    border: "1px solid rgba(34,197,94,.4)",
                    color: "#bbf7d0",
                    padding: "8px 12px",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  {feedbackStatus}
                </div>
              )}
            </section>
          )}
        </div>

        <footer
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          {tab === "profile" ? (
            <button
              onClick={onConfirmDelete}
              disabled={deleting}
              style={{
                ...btnDanger,
                opacity: deleting ? 0.7 : 1,
                cursor: deleting ? "not-allowed" : "pointer",
              }}
              type="button"
            >
              {deleting ? "Deleting…" : "Delete account"}
            </button>
          ) : (
            <span aria-hidden style={{ width: 1 }} />
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onCancel} style={btnGhost} type="button">
              Close
            </button>
            {tab === "profile" && (
              <button
                onClick={onSave}
                disabled={!dirty || saving}
                style={{
                  ...btnPrimary,
                  opacity: !dirty || saving ? 0.7 : 1,
                  cursor: !dirty || saving ? "not-allowed" : "pointer",
                }}
                type="button"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            )}
            {tab === "feedback" && (
              <button
                onClick={onSubmitFeedback}
                disabled={submittingFeedback}
                style={{
                  ...btnPrimary,
                  opacity: submittingFeedback ? 0.7 : 1,
                  cursor: submittingFeedback ? "not-allowed" : "pointer",
                }}
                type="button"
              >
                {submittingFeedback ? "Sending…" : "Submit feedback"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

const label: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  marginBottom: 6,
  color: "#cbd5e1",
};

const input: React.CSSProperties = {
  width: "100%",
  background: "#0f0f14",
  color: "#e5e7eb",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.08)",
  outline: "none",
};

const chipBase: React.CSSProperties = {
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,.08)",
  color: "#a3a3a3",
  background: "#121219",
  cursor: "pointer",
};

const chipButton: React.CSSProperties = {
  ...chipBase,
};

const chipActiveButton: React.CSSProperties = {
  ...chipBase,
  color: "#fff",
  background: "#1c1c22",
  border: "1px solid rgba(59,130,246,.5)",
};

const btn: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.08)",
  background: "#1c1c22",
  color: "#e5e7eb",
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  ...btn,
  background: "transparent",
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  background: "#3b82f6",
  border: "1px solid #2563eb",
  color: "#fff",
};

const btnDanger: React.CSSProperties = {
  ...btn,
  background: "#ef4444",
  border: "1px solid #b91c1c",
  color: "#fff",
};
