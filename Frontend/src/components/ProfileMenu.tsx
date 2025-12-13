import { useRef } from "react";

function ProfileMenu({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const menuRef = useRef<HTMLDetailsElement>(null);

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && menuRef.current) {
      menuRef.current.open = false;
    }
  };

  return (
    <details ref={menuRef} className="profile-menu" open={open} onToggle={onToggle} onKeyDown={handleKey}>
      <summary className="pill-button" aria-label="Profile and preferences">
        <span role="img" aria-hidden="true">
          👤
        </span>
        <span>Profile</span>
      </summary>
      <div className="more-menu-list" role="menu">
        <button role="menuitem" className="control-button">Account</button>
        <button role="menuitem" className="control-button">Preferences</button>
        <button role="menuitem" className="control-button">Logout</button>
      </div>
    </details>
  );
}

export default ProfileMenu;
