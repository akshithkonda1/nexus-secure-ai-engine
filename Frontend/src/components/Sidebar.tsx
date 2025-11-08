import { ReactNode, useMemo } from 'react';
import { useTheme } from '@/theme/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  MessageSquare,
  Folder,
  Sparkles,
  FileText,
  BarChart3,
  History,
  Settings as SettingsIcon,
  Home as HomeIcon
} from 'lucide-react';

type NavItem = { label: string; to: string; icon: ReactNode };

export function Sidebar({ active, onNavigate }: { active: string; onNavigate: (path: string) => void }) {
  const items = useMemo<NavItem[]>(
    () => [
      { label: 'Home', to: '/home', icon: <HomeIcon className="h-5 w-5" /> },
      { label: 'Chat', to: '/chat', icon: <MessageSquare className="h-5 w-5" /> },
      { label: 'Sessions', to: '/sessions', icon: <Folder className="h-5 w-5" /> },
      { label: 'Templates', to: '/templates', icon: <Sparkles className="h-5 w-5" /> },
      { label: 'Documents', to: '/docs', icon: <FileText className="h-5 w-5" /> },
      { label: 'Metrics', to: '/metrics', icon: <BarChart3 className="h-5 w-5" /> },
      { label: 'History', to: '/history', icon: <History className="h-5 w-5" /> },
      { label: 'Settings', to: '/settings', icon: <SettingsIcon className="h-5 w-5" /> },
    ],
    []
  );

  const isActive = (path: string) => (active === path ? 'bg-[rgba(37,99,235,0.15)] text-[var(--nexus-accent)]' : 'opacity-80');

  useTheme(); // just to ensure provider exists (and to rerender on theme change)

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 z-40 overflow-y-auto">
      <div className="h-full flex flex-col">
        <nav className="py-4">
          {items.map((i) => (
            <button
              key={i.to}
              onClick={() => onNavigate(i.to)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isActive(i.to)}`}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              {i.icon}
              <span className="text-sm">{i.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto px-3 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
