import { Search, User } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center border-b border-[var(--nexus-border)] px-4"
            style={{ backgroundColor: 'rgba(22,27,34,0.9)', backdropFilter: 'blur(12px)' }}>
      <div className="flex-1 flex items-center gap-4 max-w-7xl mx-auto w-full">
        <div className="text-xl font-semibold">Nexus <span className="text-sm opacity-70">BETA</span></div>

        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
          <input
            placeholder="Search sessions, templates, providers…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border"
            style={{
              backgroundColor: 'var(--nexus-surface)',
              color: 'var(--nexus-text)',
              borderColor: 'rgba(255,255,255,0.08)'
            }}
          />
        </div>

        <button className="hidden md:inline-flex items-center gap-2">
          <User className="h-4 w-4" />
          Profile
        </button>
      </div>
    </header>
  );
}
