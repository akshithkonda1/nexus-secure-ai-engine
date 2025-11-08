import { Search } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-surface/70 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center gap-4">
        <div className="text-foreground/90 font-semibold tracking-tight">
          Nexus <span className="text-xs opacity-70">BETA</span>
        </div>

        <div className="flex-1" />

        <div className="relative w-[520px] max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-subtle/70" />
          <input
            className="w-full pl-9 pr-3 h-10 rounded-xl bg-panel/80 border border-border/60 focus-ring"
            placeholder="Search workspace, sessions, commands…"
          />
        </div>

        <button className="ml-4 h-10 px-4 rounded-xl bg-accent text-accent-foreground hover:shadow-glow focus-ring">
          Join Waitlist
        </button>
      </div>
    </header>
  );
}
