import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { BrandMark } from "@/shared/ui/BrandMark";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { useEffect } from "react";
import { useSession } from "@/shared/state/session";
import { isLocked } from "@/shared/lib/lock";

export function AppShell() {
  const { theme, setTheme } = useTheme();
  const { plan } = useSession();
  const { locked, untilISO } = isLocked();
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    if (loc.pathname === "/app") nav("/");
  }, [loc, nav]);

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr_320px] grid-rows-[56px_1fr] bg-background text-foreground">
      {/* Topbar */}
      <header className="col-span-3 row-start-1 border-b flex items-center gap-4 px-4">
        <BrandMark className="h-5" />
        <input
          aria-label="Search"
          placeholder="Search… ⌘K"
          className="flex-1 max-w-xl px-3 py-2 rounded-md bg-muted/30 outline-none"
        />
        <button disabled className="text-xs rounded-full px-3 py-1 border">
          {locked
            ? `Plan: ${plan} · Upgrades open ${new Date(untilISO).toLocaleDateString()}`
            : `Plan: ${plan}`}
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="px-3 py-1 rounded-md border"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        <Link to="/login" className="px-3 py-1 rounded-md bg-primary text-primary-foreground">
          Sign in
        </Link>
      </header>

      {/* Sidebar */}
      <aside className="row-start-2 col-start-1 border-r px-3 py-4 space-y-2">
        <nav className="space-y-1">
          {[
            ["Chats", "/chat"],
            ["Projects", "/projects"],
            ["Library", "/system#library"],
            ["System", "/system"],
            ["Pricing", "/pricing"],
            ["Settings", "/system#settings"],
          ].map(([label, href]) => (
            <Link key={label} to={href} className="block px-3 py-2 rounded-md hover:bg-muted/40">
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 text-xs text-muted-foreground">Proof-first intelligence.</div>
      </aside>

      {/* Main */}
      <main className="row-start-2 col-start-2 p-6">
        <Outlet />
      </main>

      {/* Right Rail */}
      <aside className="row-start-2 col-start-3 border-l p-4 space-y-3">
        <h3 className="text-sm font-semibold">Projects</h3>
        {/* Simple recent list placeholder; real data in ProjectsPane */}
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>New onboarding deck</li>
          <li>Explain RAG tradeoffs</li>
          <li>Bias audit sample</li>
        </ul>
      </aside>
    </div>
  );
}
