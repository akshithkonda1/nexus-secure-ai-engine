import React from 'react';
import { Moon, ShieldCheck, Sparkles, Sun, UserCircle2 } from 'lucide-react';
const TopBar: React.FC<{ isDark: boolean; onToggleTheme: ()=>void; onOpenProfile: ()=>void }>=({isDark,onToggleTheme,onOpenProfile})=> (
  <header className="chatgpt-main-header">
    <div className="chatgpt-brand">
      <span className="chatgpt-brand-title flex items-center gap-2">
        <Sparkles size={18} /> Nexus
      </span>
      <span className="chatgpt-brand-subtitle flex items-center gap-1">
        <ShieldCheck size={14} /> Zero-trust orchestration workspace
      </span>
    </div>
    <div className="chatgpt-header-actions">
      <button onClick={onToggleTheme} className="chatgpt-header-button" aria-label="Toggle theme">
        {isDark? <Sun size={18}/> : <Moon size={18}/>}
      </button>
      <button
        onClick={onOpenProfile}
        onMouseEnter={()=>import('./modals/ProfileModal')}
        onFocus={()=>import('./modals/ProfileModal')}
        className="chatgpt-header-button"
        aria-label="Open profile"
      >
        <UserCircle2 size={20}/>
      </button>
    </div>
  </header>
);
export default TopBar;
