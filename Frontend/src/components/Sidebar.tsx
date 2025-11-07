import { NavLink } from 'react-router-dom'
import {
  MessageCircle, Folder, FileText, BarChart3, History, Settings as Cog, Sparkles,
  Sun, Moon, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { useTheme } from '@/theme/useTheme'
import { useState } from 'react'

export default function Sidebar() {
  const { theme, setTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const items = [
    { label: 'Chat',      to: '/',           icon: <MessageCircle className="w-5 h-5" /> },
    { label: 'Projects',  to: '/projects',   icon: <Folder className="w-5 h-5" /> },
    { label: 'Templates', to: '/templates',  icon: <Sparkles className="w-5 h-5" /> },
    { label: 'Documents', to: '/documents',  icon: <FileText className="w-5 h-5" /> },
    { label: 'Analytics', to: '/analytics',  icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'History',   to: '/history',    icon: <History className="w-5 h-5" /> },
    { label: 'Settings',  to: '/settings',   icon: <Cog className="w-5 h-5" /> },
  ]

  return (
    <aside className={`fixed top-0 left-0 h-full flex flex-col border-r border-border/40
      ${isCollapsed ? 'w-20' : 'w-64'} bg-[var(--nexus-surface)] transition-all duration-300`}>
      {/* header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
        {!isCollapsed && <h1 className="text-lg font-semibold">Nexus <span className="text-xs text-gray-400">BETA</span></h1>}
        <button
          onClick={() => setIsCollapsed(v => !v)}
          className="p-2 rounded-md hover:bg-[var(--nexus-card)] text-gray-400 hover:text-white"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {items.map(item => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `mx-3 mb-1 flex items-center gap-3 rounded-xl px-5 py-3 transition-all
              ${isActive
                ? 'bg-[var(--nexus-accent)]/20 text-[var(--nexus-accent)] font-medium'
                : 'text-gray-400 hover:bg-[var(--nexus-card)] hover:text-gray-100'}`
            }
          >
            {item.icon}
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* footer: theme toggle */}
      <div className="p-4 border-t border-border/40">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg
                     border border-border/50 hover:border-[var(--nexus-accent)]
                     hover:bg-[var(--nexus-accent)]/10 transition-all">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
            {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </div>
          <div className={`relative h-5 w-10 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <span className={`absolute top-[2px] left-[2px] h-4 w-4 bg-white rounded-full transition-transform
              ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>
    </aside>
  )
}
