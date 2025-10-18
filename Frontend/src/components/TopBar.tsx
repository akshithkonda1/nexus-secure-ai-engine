import React from 'react';
import { Settings, ShieldCheck, UserCircle2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

type TopBarProps = {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  profileAvatar?: string | null;
};

const TopBar: React.FC<TopBarProps> = ({ isDark, onToggleTheme, onOpenSettings, onOpenProfile, profileAvatar }) => (
  <header className="chatgpt-main-header">
    <div className="chatgpt-brand">
      <span className="chatgpt-brand-title flex items-center gap-2">
        Nexus
      </span>
      <span className="chatgpt-brand-subtitle flex items-center gap-1">
        <ShieldCheck size={14} /> Zero-trust orchestration workspace
      </span>
    </div>
    <div className="chatgpt-header-actions">
      <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      <button
        type="button"
        onClick={onOpenSettings}
        className="chatgpt-header-button"
        aria-label="Open settings"
        title="Settings"
      >
        <Settings size={18} />
      </button>
      <button
        onClick={onOpenProfile}
        onMouseEnter={() => import('./modals/ProfileModal')}
        onFocus={() => import('./modals/ProfileModal')}
        className="chatgpt-header-button"
        aria-label="Open profile"
      >
        {profileAvatar ? (
          <img
            src={profileAvatar}
            alt="Profile avatar"
            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <UserCircle2 size={20} />
        )}
      </button>
    </div>
  </header>
);
export default TopBar;
