import React, { useEffect, useMemo, useRef, useState } from "react";
import type { UserProfile } from "../state/profile";
import type { ConversationStatus } from "./db";
import type { ProfileSheetTab } from "./ProfileSheet";

type ProfileMenuProps = {
  profile: UserProfile;
  status: ConversationStatus | null;
  onOpenTab: (tab: ProfileSheetTab) => void;
  onOpenSystemSettings: () => void;
  onArchive?: () => void | Promise<void>;
  onRestore?: () => void | Promise<void>;
  onMoveToTrash?: () => void | Promise<void>;
  onPurge?: () => void | Promise<void>;
};

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  profile,
  status,
  onOpenTab,
  onOpenSystemSettings,
  onArchive,
  onRestore,
  onMoveToTrash,
  onPurge,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const initials = useMemo(() => {
    if (profile.avatarDataUrl) return "";
    const parts = (profile.displayName || "User").split(/\s+/);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "NX";
  }, [profile.avatarDataUrl, profile.displayName]);

  const run = (fn?: () => void | Promise<void>) => () => {
    if (!fn) return;
    Promise.resolve(fn()).finally(() => setOpen(false)).catch(() => setOpen(false));
  };

  const conversationActions = () => {
    if (!status) {
      return (
        <p className="muted small" style={{ margin: "4px 0 0" }}>
          Select a conversation to manage archive or deletion.
        </p>
      );
    }
    if (status === "active") {
      return (
        <>
          <button type="button" onClick={run(onArchive)} role="menuitem">
            🗄 Archive conversation
          </button>
          <button type="button" onClick={run(onMoveToTrash)} role="menuitem">
            🗑 Delete conversation
          </button>
        </>
      );
    }
    if (status === "archived") {
      return (
        <>
          <button type="button" onClick={run(onRestore)} role="menuitem">
            ↩ Restore conversation
          </button>
          <button type="button" onClick={run(onMoveToTrash)} role="menuitem">
            🗑 Move to trash
          </button>
        </>
      );
    }
    return (
      <>
        <button type="button" onClick={run(onRestore)} role="menuitem">
          ↩ Restore conversation
        </button>
        <button type="button" className="danger" onClick={run(onPurge)} role="menuitem">
          ✖ Permanently delete
        </button>
      </>
    );
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        title="Account & profile"
      >
        {profile.avatarDataUrl ? (
          <img src={profile.avatarDataUrl} alt="Profile avatar" />
        ) : (
          <span>{initials}</span>
        )}
      </button>
      {open && (
        <div className="profile-dropdown" role="menu">
          <div className="profile-dropdown-head">
            <div className="profile-avatar-small" aria-hidden>
              {profile.avatarDataUrl ? (
                <img src={profile.avatarDataUrl} alt="Profile avatar" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div>
              <div className="profile-name">{profile.displayName || "Nexus Explorer"}</div>
              <div className="muted small">{profile.email || "explorer@nexus.ai"}</div>
            </div>
          </div>
          <div className="profile-dropdown-section">
            <button type="button" onClick={() => { onOpenTab("user"); setOpen(false); }} role="menuitem">
              ⚙️ User Settings
            </button>
            <button type="button" onClick={() => { onOpenTab("plan"); setOpen(false); }} role="menuitem">
              💳 Plan & Billing
            </button>
            <button type="button" onClick={() => { onOpenTab("feedback"); setOpen(false); }} role="menuitem">
              📨 System Feedback
            </button>
            <button type="button" onClick={() => { onOpenSystemSettings(); setOpen(false); }} role="menuitem">
              🛠 System Settings
            </button>
          </div>
          <div className="profile-divider" />
          <div className="profile-dropdown-section conversation">
            <div className="section-label">Conversation</div>
            {conversationActions()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
