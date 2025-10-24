import React, { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  CreditCard,
  MessageSquareWarning,
  Trash2,
  Undo2,
  UserCog,
} from "lucide-react";
import type { UserProfile } from "../state/profile";
import type { ConversationStatus } from "./db";
import type { ProfileSheetTab } from "./ProfileSheet";

type ProfileMenuProps = {
  profile: UserProfile;
  status: ConversationStatus | null;
  onOpenTab: (tab: ProfileSheetTab) => void;
  onArchive?: () => void | Promise<void>;
  onRestore?: () => void | Promise<void>;
  onMoveToTrash?: () => void | Promise<void>;
  onPurge?: () => void | Promise<void>;
};

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  profile,
  status,
  onOpenTab,
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

  const MenuButton: React.FC<{
    icon: LucideIcon;
    label: string;
    tone?: "default" | "danger";
    onSelect: () => void;
  }> = ({ icon: Icon, label, tone = "default", onSelect }) => (
    <button
      type="button"
      onClick={onSelect}
      role="menuitem"
      data-tone={tone}
    >
      <span className="menu-icon" aria-hidden>
        <Icon size={16} strokeWidth={2} />
      </span>
      <span className="menu-label">{label}</span>
    </button>
  );

  const conversationActions = () => {
    if (!status) {
      return (
        <div className="menu-empty">
          Select a conversation to manage archive or deletion.
        </div>
      );
    }
    if (status === "active") {
      return (
        <>
          <MenuButton icon={Archive} label="Archive conversation" onSelect={run(onArchive)} />
          <MenuButton icon={Trash2} label="Move to trash" onSelect={run(onMoveToTrash)} />
        </>
      );
    }
    if (status === "archived") {
      return (
        <>
          <MenuButton icon={Undo2} label="Restore conversation" onSelect={run(onRestore)} />
          <MenuButton icon={Trash2} label="Move to trash" onSelect={run(onMoveToTrash)} />
        </>
      );
    }
    return (
      <>
        <MenuButton icon={Undo2} label="Restore conversation" onSelect={run(onRestore)} />
        <MenuButton icon={Trash2} label="Delete permanently" tone="danger" onSelect={run(onPurge)} />
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
            <MenuButton
              icon={UserCog}
              label="User Settings"
              onSelect={() => {
                onOpenTab("user");
                setOpen(false);
              }}
            />
            <MenuButton
              icon={CreditCard}
              label="Plan & Billing"
              onSelect={() => {
                onOpenTab("plan");
                setOpen(false);
              }}
            />
            <MenuButton
              icon={MessageSquareWarning}
              label="System Feedback"
              onSelect={() => {
                onOpenTab("feedback");
                setOpen(false);
              }}
            />
          </div>
          <div className="profile-divider" />
          <div className="profile-dropdown-section conversation">
            <div className="section-label">CONVERSATION</div>
            {conversationActions()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
