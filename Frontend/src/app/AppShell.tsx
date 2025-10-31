import { Suspense, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/shared/ui/components/avatar";
import { Badge } from "@/shared/ui/components/badge";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/components/dropdown-menu";
import { Input } from "@/shared/ui/components/input";
import { Separator } from "@/shared/ui/components/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/components/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/components/tooltip";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { ModeToggle } from "@/features/mode/ModeToggle";
import { ProfileModal } from "@/features/profile/ProfileModal";
import { Toaster } from "@/shared/ui/components/toast";
import { useUIStore } from "@/shared/state/ui";
import { useSessionStore } from "@/shared/state/session";
import { useChatStore } from "@/shared/state/chats";
import { BrandMark } from "@/shared/ui/brand";
import { useCapabilities } from "@/services/api/client";
import { isLocked } from "@/shared/lib/lock";
import { logEvent } from "@/shared/lib/audit";
import { getProfile, type Profile } from "@/services/storage/profile";

const navigation = [
  { label: "Welcome", to: "/" },
  { label: "Chat", to: "/chat" },
  { label: "Projects", to: "/projects" },
  { label: "Library", to: "/library" },
  { label: "System", to: "/system" },
  { label: "Pricing", to: "/pricing" },
  { label: "Settings", to: "/settings" }
] as const;

const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function AppShell() {
  const [profile, setProfile] = useState<Profile>(() => getProfile());
  const setProfileOpen = useUIStore((state) => state.setProfileOpen);
  const createChat = useChatStore((state) => state.createChat);
  const setActiveChatId = useSessionStore((state) => state.setActiveChatId);
  const plan = useSessionStore((state) => state.plan);
  const lockedUntilISO = useSessionStore((state) => state.lockedUntilISO);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: capabilities } = useCapabilities();

  const locked = useMemo(() => isLocked(lockedUntilISO), [lockedUntilISO]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<Profile>).detail;
      if (detail) {
        setProfile(detail);
      } else {
        setProfile(getProfile());
      }
    };
    window.addEventListener("profile:updated", handler);
    return () => window.removeEventListener("profile:updated", handler);
  }, []);

  const handleNewChat = () => {
    const chat = createChat();
    setActiveChatId(chat.id);
    navigate("/chat");
    logEvent("chat.newButton");
  };

  const searchPlaceholder = useMemo(() => {
    if (location.pathname === "/projects") return "Search projects";
    if (location.pathname === "/library") return "Search library";
    return "Search Nexus";
  }, [location.pathname]);

  return (
    <TooltipProvider>
      <a
        href="#main"
        className={`sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground ${focusRing}`}
      >
        Skip to content
      </a>
      <div className="grid min-h-screen grid-cols-[auto_1fr_auto] bg-app text-app lg:grid-cols-[280px_1fr_320px]">
        <aside className="hidden border-r border-app/60 bg-surface/70 px-6 py-8 lg:flex lg:flex-col lg:gap-10">
          <div className="space-y-6">
            <BrandMark className="h-8" />
            <nav className="flex flex-col gap-1 text-sm">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-2 transition ${
                      isActive ? "bg-primary/10 text-primary shadow-press" : "text-muted hover:text-app"
                    }`
                  }
                >
                  <span>{item.label}</span>
                  {item.to === "/pricing" && locked && <Badge variant="outline">Locked</Badge>}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="space-y-6">
            <Button
              onClick={handleNewChat}
              className="w-full rounded-xl bg-primary text-primary-foreground shadow-press"
            >
              Start a chat
            </Button>
            <Separator className="border-app/60" />
            <div className="flex items-center gap-3 rounded-2xl border border-app/50 bg-app/60 p-4 shadow-ambient">
              <Avatar className="h-10 w-10">
                {profile.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt="Profile avatar" />
                ) : (
                  <AvatarFallback>{profile.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{profile.displayName}</p>
                <Button variant="ghost" className="h-auto p-0 text-xs text-primary hover:bg-transparent" onClick={() => setProfileOpen(true)}>
                  View profile
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-app/40 bg-surface/70 px-4 py-3">
              <span className="text-xs uppercase tracking-wide text-muted">Workspace mode</span>
              <ModeToggle />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-app/40 bg-surface/70 px-4 py-3">
              <span className="text-xs uppercase tracking-wide text-muted">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between gap-4 border-b border-app/60 bg-surface/80 px-4 py-4 backdrop-blur-md lg:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" aria-label="Open navigation" className={focusRing}>
                    Menu
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 bg-surface">
                  <div className="flex items-center justify-between">
                    <BrandMark />
                    <ThemeToggle />
                  </div>
                  <nav className="mt-6 flex flex-col gap-2">
                    {navigation.map((item) => (
                      <Button
                        key={item.to}
                        variant="ghost"
                        className="justify-start rounded-xl"
                        onClick={() => navigate(item.to)}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                  <div className="mt-8 space-y-4">
                    <Button className="w-full" onClick={handleNewChat}>
                      Start a chat
                    </Button>
                    <Button variant="ghost" className="h-auto w-full justify-start p-0 text-primary hover:bg-transparent" onClick={() => setProfileOpen(true)}>
                      Manage profile
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <BrandMark />
            </div>
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder={searchPlaceholder}
                  aria-label="Search"
                  className="h-11 rounded-xl bg-app/70 pl-4 pr-16 shadow-inner"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 select-none text-xs text-muted">
                  ⌘K
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button variant="subtle" className="rounded-full px-4" disabled={locked} onClick={() => navigate("/pricing")}>
                      Plan: {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </Button>
                  </span>
                </TooltipTrigger>
                {locked && (
                  <TooltipContent className="max-w-xs text-sm">
                    Upgrades unlock on {new Date(lockedUntilISO).toLocaleDateString()}. Pricing is locked until then.
                  </TooltipContent>
                )}
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" aria-label="Open profile" className="rounded-full px-3">
                    <Avatar className="h-8 w-8">
                      {profile.avatarUrl ? (
                        <AvatarImage src={profile.avatarUrl} alt="Profile avatar" />
                      ) : (
                        <AvatarFallback>{profile.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setProfileOpen(true)}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <section id="main" className="flex flex-1 flex-col bg-gradient-to-b from-surface/80 to-surface px-4 py-6 lg:px-8">
            <Suspense fallback={<div className="flex flex-1 items-center justify-center text-muted">Loading…</div>}>
              <Outlet />
            </Suspense>
          </section>
        </main>

        <aside className="hidden border-l border-app/60 bg-surface/60 px-6 py-8 lg:flex lg:flex-col lg:gap-6">
          <Card className="border-none bg-transparent shadow-none">
            <CardHeader className="p-0">
              <CardTitle className="text-sm font-semibold text-muted">Quick Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-0 pt-4">
              {(capabilities?.projects ?? []).length === 0 && (
                <p className="text-xs text-muted">Projects you pin will appear here once capabilities sync.</p>
              )}
              {(capabilities?.projects ?? []).map((project) => (
                <Button
                  key={project.id}
                  variant="ghost"
                  className="w-full justify-start rounded-xl border border-transparent bg-app/40 px-4 py-3 text-left shadow-press hover:border-app/40"
                >
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    {project.status && <p className="text-xs text-muted">{project.status}</p>}
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
          <Card className="border-none bg-app/50 shadow-ambient">
            <CardHeader className="space-y-1">
              <CardTitle className="text-sm font-semibold">Need inspiration?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted">
              <p>Use NexusOS mode for automation-first canvases.</p>
              <Button variant="ghost" className="h-auto p-0 text-primary hover:bg-transparent" onClick={handleNewChat}>
                Open automation canvas →
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
      <ProfileModal />
      <Toaster />
    </TooltipProvider>
  );
}
