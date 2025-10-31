import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { BrandMark } from "@/shared/ui/BrandMark";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { useSession } from "@/shared/state/session";
import { Badge } from "@/shared/ui/components/badge";
import { Separator } from "@/shared/ui/components/separator";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";

function NavItem({ to, children }: React.PropsWithChildren<{ to: string }>) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center rounded-lg px-3 py-2 text-sm ${
          isActive
            ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black"
            : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function AppShell() {
  const { theme, toggle } = useTheme();
  const { plan } = useSession();

  return (
    <div className="min-h-screen grid grid-cols-[260px_1fr_300px] grid-rows-[56px_1fr] bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Topbar */}
      <header className="col-span-3 row-start-1 flex items-center gap-4 px-4 border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/" aria-label="Nexus home" className="flex items-center gap-2">
          <BrandMark className="h-6" />
        </Link>
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Input placeholder="Search…  ⌘K" aria-label="Global search" />
          </div>
        </div>
        <Badge variant="outline" className="rounded-full">{plan.toUpperCase()}</Badge>
        <Button variant="ghost" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? "Light" : "Dark"}
        </Button>
      </header>

      {/* Sidebar */}
      <aside className="row-start-2 col-start-1 border-r border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
        <nav className="space-y-1">
          <NavItem to="/chat">Chats</NavItem>
          <NavItem to="/projects">Projects</NavItem>
          <NavItem to="/library">Library</NavItem>
          <NavItem to="/system">System</NavItem>
          <NavItem to="/pricing">Pricing</NavItem>
          <NavItem to="/settings">Settings</NavItem>
          <Separator className="my-3" />
          <NavItem to="/auth">Sign in / Create account</NavItem>
        </nav>
        <div className="mt-8 text-xs text-neutral-500">Proof-first intelligence.</div>
      </aside>

      {/* Main content */}
      <main className="row-start-2 col-start-2 p-6">
        <Outlet />
      </main>

      {/* Right rail */}
      <aside className="row-start-2 col-start-3 border-l border-neutral-200 dark:border-neutral-800 p-4">
        <h3 className="text-sm font-semibold mb-3">Projects</h3>
        <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
          <li>
            <Link to="/projects/1" className="hover:underline">
              New Project
            </Link>
          </li>
          <li>
            <Link to="/projects/2" className="hover:underline">
              Research: officials
            </Link>
          </li>
          <li>
            <Link to="/projects/3" className="hover:underline">
              Senior lead brief
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
}
