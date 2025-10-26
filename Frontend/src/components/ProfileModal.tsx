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

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_MB = 8;

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

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNote(null);
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
    onClose();
  }

  const previewSrc = tempPreview ?? avatarUrl ?? undefined;

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
          <h2 id="profile-title" style={{ fontSize: 22, margin: 0 }}>Profile</h2>
          <button onClick={onCancel} aria-label="Close" style={btnGhost}>✕</button>
        </header>

        <nav style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <span style={chipActive}>Profile</span>
          <span style={chip}>Plan & Billing</span>
          <span style={chip}>System Feedback</span>
        </nav>

        <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
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
                  <img src={previewSrc} alt="Avatar preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                ) : (
                  <span style={{ fontWeight: 700 }}>Ne</span>
                )}
              </div>

              <label style={{ ...btn }}>
                Choose File
                <input type="file" accept={ACCEPT.join(",")}
                  style={{ display: "none" }} onChange={onPickFile}/>
              </label>

              {(tempFile || avatarUrl) && (
                <button onClick={onRemovePhoto} style={btnGhost}>Remove photo</button>
              )}
            </div>
            <div aria-live="polite" style={{ marginTop: 8, fontSize: 13, color: "#a3a3a3" }}>
              {note}
            </div>
          </section>

          <section>
            <label style={label}>Display name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80} placeholder="Your name" style={input}/>
          </section>

          <section>
            <label style={label}>Email</label>
            <input value={email} readOnly style={{ ...input, opacity: 0.8 }}/>
          </section>

          {error && (
            <div role="alert"
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
          <button onClick={onConfirmDelete} disabled={deleting}
            style={{ ...btnDanger, opacity: deleting ? 0.7 : 1,
              cursor: deleting ? "not-allowed" : "pointer" }}>
            {deleting ? "Deleting…" : "Delete account"}
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onCancel} style={btnGhost}>Cancel</button>
            <button onClick={onSave} disabled={!dirty || saving}
              style={{ ...btnPrimary, opacity: !dirty || saving ? 0.7 : 1,
                cursor: !dirty || saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving…" : "Save changes"}
            </button>
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

const chip: React.CSSProperties = {
  fontSize: 13,
  padding: "6px 10px",
  borderRadius: 8,
  background: "#121219",
  border: "1px solid rgba(255,255,255,.08)",
  color: "#a3a3a3",
};

const chipActive: React.CSSProperties = {
  ...chip,
  color: "#fff",
  background: "#1c1c22",
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
