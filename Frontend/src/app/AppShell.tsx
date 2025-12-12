import { Outlet, NavLink } from "react-router-dom";
import { BrandMark } from "@/shared/ui/BrandMark";
import { ThemeToggle } from "@/shared/ui/theme/ThemeToggle";
import { Button } from "@/shared/ui/components/button";
import React from "react";
import { useSession } from "@/shared/state/session";

function cx(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function AppShell() {
  const { user } = useSession();
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          <div className="panel panel--glassy panel--hover flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
            <div className="i" aria-hidden>
              🔎
            </div>
            <input id="global-search" placeholder="Search" className="input flex-1 border-0 bg-transparent px-0 outline-none text-sm" />
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
        <div className="absolute bottom-0 left-0 right-0 border-t p-3 space-y-3">
          <ThemeToggle className="w-full justify-between rounded-xl border border-border bg-background text-xs uppercase tracking-wide" />
          <div className="panel panel--glassy panel--hover flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
            <div className="grid size-7 place-items-center rounded-full bg-muted text-xs font-medium">{initials}</div>
            <div className="text-sm">
              <div className="font-medium">{user.name}</div>
              <div className="text-muted-foreground text-xs">{user.handle}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Topbar + main content */}
      <main className="pl-64">
        <div className="h-16 sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-[rgba(var(--subtle),0.95)]">AI Chat</div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="rounded-full px-3 py-1 text-sm">
              ⚡ Upgrade
            </Button>
            <button aria-label="Notifications" className="btn btn-ghost rounded-full p-2 hover:bg-muted">
              🔔
            </button>
            <button aria-label="Grid" className="btn btn-ghost rounded-full p-2 hover:bg-muted">
              ⬛
            </button>
            <button aria-label="Assistant" className="btn btn-ghost rounded-full p-2 hover:bg-muted">
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

