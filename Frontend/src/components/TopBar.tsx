import React from 'react';
import { Moon, Sun, UserCircle2 } from 'lucide-react';
const TopBar: React.FC<{ isDark: boolean; onToggleTheme: ()=>void; onOpenProfile: ()=>void }>=({isDark,onToggleTheme,onOpenProfile})=> (
  <header className="flex items-center gap-3 mb-3">
    <button onClick={onToggleTheme} className="p-2 card-token rounded-xl" aria-label="Toggle theme">{isDark? <Sun/> : <Moon/>}</button>
    <h1 className="font-semibold">Nexus</h1>
    <button onClick={onOpenProfile} onMouseEnter={()=>import('./modals/ProfileModal')} onFocus={()=>import('./modals/ProfileModal')} className="ml-auto p-2 card-token rounded-xl" aria-label="Open Profile"><UserCircle2/></button>
  </header>
);
export default TopBar;
