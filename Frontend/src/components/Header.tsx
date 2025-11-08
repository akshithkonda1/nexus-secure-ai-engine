import { Search, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center z-50 px-4 bg-[color:var(--nexus-surface)]/90 backdrop-blur-md border-b border-[color:var(--nexus-border)]">
      <div className="flex-1 flex items-center gap-3">
        <span className="text-lg font-semibold glow-text">Nexus</span>
        <div className="relative w-full max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-2.5 opacity-70" />
          <input
            className="pl-9 pr-3 py-2 w-full rounded-lg bg-[color:var(--nexus-card)] border border-[color:var(--nexus-border)] text-sm"
            placeholder="Search sessions, templates, providers…"
          />
        </div>
      </div>
      <button className="ml-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        Join Waitlist
      </button>
    </header>
  );
}
