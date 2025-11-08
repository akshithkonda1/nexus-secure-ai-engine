import { ReactNode } from 'react';
import {
  MessageSquareMore, Layers, FolderOpenDot, FileText, Users,
  LineChart, History as HistoryIcon, Settings, SunMoon
} from 'lucide-react';
import { toggleTheme } from '@/lib/theme';

type Item = { to: string; label: string; icon: ReactNode; };

const items: Item[] = [
  { to: '/chat',      label: 'Chat',       icon: <MessageSquareMore className="size-5" /> },
  { to: '/projects',  label: 'Projects',   icon: <FolderOpenDot className="size-5" /> },
  { to: '/templates', label: 'Templates',  icon: <Layers className="size-5" /> },
  { to: '/documents', label: 'Documents',  icon: <FileText className="size-5" /> },
  { to: '/community', label: 'Community',  icon: <Users className="size-5" /> },
  { to: '/history',   label: 'History',    icon: <HistoryIcon className="size-5" /> },
  { to: '/settings',  label: 'Settings',   icon: <Settings className="size-5" /> }
];

export function Sidebar({ active, onNavigate }: { active: string; onNavigate: (p: string) => void; }) {
  return (
    <aside className="bg-surface/70 backdrop-blur-xl border-r border-border/60 flex flex-col">
      <div className="h-16" />
      <nav className="flex flex-col items-center gap-1 py-4">
        {items.map((i) => {
          const isActive = active.startsWith(i.to);
          return (
            <button
              key={i.to}
              onClick={() => onNavigate(i.to)}
              className={`w-12 h-12 grid place-items-center rounded-xl hover-soft focus-ring
                ${isActive ? 'bg-panel/90 text-foreground' : 'text-subtle'}`}
              title={i.label}
            >
              {i.icon}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-3">
        <button
          onClick={toggleTheme}
          className="w-12 h-12 grid place-items-center rounded-xl text-subtle hover-soft focus-ring"
          title="Toggle theme"
        >
          <SunMoon className="size-5" />
        </button>
      </div>
    </aside>
  );
}
