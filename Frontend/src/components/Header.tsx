import { Search, Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-lg font-semibold text-accent shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-semibold text-foreground">Nexus</p>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted">BETA</p>
          </div>
        </div>

        <div className="hidden flex-1 items-center sm:flex">
          <label
            htmlFor="global-search"
            className="relative flex w-full items-center justify-between rounded-full border border-border/70 bg-card/80 px-5 py-2.5 text-sm text-muted shadow-soft transition focus-within:border-accent/60 focus-within:shadow-glow"
          >
            <Search className="h-4 w-4 text-muted" />
            <input
              id="global-search"
              name="global-search"
              placeholder="Search"
              className="ml-3 w-full bg-transparent text-sm text-foreground placeholder:text-muted/70 focus-visible:outline-none"
              type="search"
              autoComplete="off"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="pill-button hidden sm:inline-flex bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground"
          >
            Join Waitlist
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
