import { Search, Sparkles } from "lucide-react";

const Header = () => {
  return (
    <header className="header">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white/90 font-semibold">Nexus</span>
            <span className="badge">BETA</span>
          </div>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="relative w-full max-w-[680px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              className="input w-full pl-9"
              placeholder="Search workspace, sessions, commands…"
              type="search"
              aria-label="Search workspace"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn h-9 px-4">Join Waitlist</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
