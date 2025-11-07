import { Menu, Search } from "lucide-react";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center border-b border-white/10 bg-elevated/90 backdrop-blur lg:left-64">
      <div className="flex w-full items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Open navigation"
          className="inline-flex items-center justify-center rounded-lg border border-white/10 p-2 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex flex-1 items-center gap-4">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            Nexus <span className="ml-1 text-xs font-medium uppercase text-muted">Beta</span>
          </h1>
          <div className="hidden flex-1 items-center gap-2 rounded-lg border border-white/10 bg-surface/60 px-3 py-2 text-sm text-muted shadow-inner transition hover:border-white/20 focus-within:border-primary focus-within:text-white lg:flex">
            <Search className="h-4 w-4" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search"
              className="h-5 w-full bg-transparent text-sm text-white placeholder:text-muted focus:outline-none"
            />
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Join Waitlist
        </button>
      </div>
    </header>
  );
}

export default Header;
