import { Search } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center">
      <div className="w-full container-page flex items-center gap-4">
        <div className="flex items-center gap-2 text-[15px] font-semibold">
          <span>Nexus</span>
          <span className="text-xs rounded-md border px-1.5 py-0.5 opacity-80">BETA</span>
        </div>

        <div className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
          <input
            placeholder="Search sessions, templates, providers…"
            className="pl-9 pr-3 py-2 w-full"
          />
        </div>

        <button className="rounded-xl border px-3 py-2 hover:shadow-glow">Join Waitlist</button>
      </div>
    </header>
  );
}
