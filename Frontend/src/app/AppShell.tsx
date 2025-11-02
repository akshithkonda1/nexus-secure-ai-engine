import { Outlet, NavLink } from "react-router-dom";
import { BrandMark } from "@/shared/ui/BrandMark";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { Button } from "@/shared/ui/components/button";
import { useMemo } from "react";

function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Left sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-card">
        <div className="h-14 flex items-center px-4 border-b">
          <BrandMark className="h-5" />
        </div>

        <div className="p-3">
          {/* Search */}
          <label className="sr-only" htmlFor="global-search">
            Search
          </label>
          <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
            <div className="i" aria-hidden>
              🔎
            </div>
            <input id="global-search" placeholder="Search" className="flex-1 bg-transparent outline-none text-sm" />
            <kbd className="text-xs text-muted-foreground">⌘K</kbd>
          </div>

          {/* Nav */}
          <nav className="mt-3 space-y-1">
            <NavItem to="/" label="AI Chat" end />
            <NavItem to="/projects" label="Projects" />
            <NavItem to="/library" label="Library" />
            <NavItem to="/pricing" label="Pricing" badge="NEW" />
            <NavItem to="/system" label="System" />
          </nav>

          <div className="mt-6 text-[11px] uppercase tracking-wide text-muted-foreground">Settings &amp; Help</div>
          <nav className="mt-2 space-y-1">
            <NavItem to="/settings" label="Settings" />
            <NavItem to="/help" label="Help" />
          </nav>
        </div>

        {/* Footer: theme + profile */}
        <div className="absolute bottom-0 left-0 right-0 border-t p-3">
          <div className="flex items-center justify-between rounded-xl border bg-background px-3 py-2">
            <span className="text-sm">Light</span>
            <ThemeToggle />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
            <div className="size-7 rounded-full bg-muted grid place-items-center">👤</div>
            <div className="text-sm">
              <div className="font-medium">Emilia Caitlin</div>
              <div className="text-muted-foreground text-xs">hey@unspace.agency</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right rail */}
      <aside className="fixed inset-y-0 right-0 w-[320px] border-l bg-card">
        <div className="h-14 flex items-center justify-between px-4 border-b">
          <div className="text-sm font-semibold">
            Projects <span className="text-muted-foreground">(7)</span>
          </div>
          <button className="text-muted-foreground">⋯</button>
        </div>
        <ProjectsRail />
      </aside>

      {/* Topbar + main content */}
      <main className="pl-64 pr-[320px]">
        <div className="h-14 sticky top-0 z-20 border-b bg-background/80 backdrop-blur flex items-center justify-between px-4">
          <div className="text-sm font-medium">AI Chat</div>
          <div className="flex items-center gap-2">
            <Button className="rounded-full px-3 py-1 text-sm">
              ⚡ Upgrade
            </Button>
            <button aria-label="Notifications" className="rounded-full p-2 hover:bg-muted">
              🔔
            </button>
            <button aria-label="Grid" className="rounded-full p-2 hover:bg-muted">
              ⬛
            </button>
            <button aria-label="Assistant" className="rounded-full p-2 hover:bg-muted">
              🤖
            </button>
          </div>
        </div>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, label, badge, end = false }: { to: string; label: string; badge?: string; end?: boolean }) {
  const base = "flex items-center justify-between rounded-xl px-3 py-2 text-sm";
  return (
    <NavLink to={to} end={end} className={({ isActive }) => cx(base, isActive ? "bg-muted font-medium" : "hover:bg-muted")}
    >
      <span>{label}</span>
      {badge ? <span className="text-[10px] rounded-full bg-purple-600/15 text-purple-600 px-2 py-0.5">{badge}</span> : null}
    </NavLink>
  );
}

function ProjectsRail() {
  const items = useMemo(
    () => [
      "New Project",
      "Learning From 100 Years of…",
      "Research officiants",
      "What does a senior lead de…",
      "Write a sweet note to your…",
      "Meet with cake bakers",
      "Meet with cake bakers",
    ],
    [],
  );
  return (
    <ul className="p-2 space-y-2">
      {items.map((t, i) => (
        <li key={i} className="rounded-xl border bg-background p-3 hover:bg-muted/50 transition">
          <div className="text-sm font-medium truncate" title={t}>
            {t}
          </div>
          <div className="text-xs text-muted-foreground">…</div>
        </li>
      ))}
    </ul>
  );
}
