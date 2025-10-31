import { Suspense, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/components/avatar";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/ui/components/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/components/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/components/tooltip";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { ModeToggle } from "@/features/mode/ModeToggle";
import { ProfileModal } from "@/features/profile/ProfileModal";
import { Toaster } from "@/shared/ui/components/toast";
import { useUIStore } from "@/shared/state/ui";
import { useChatStore } from "@/shared/state/chats";
import { useSessionStore } from "@/shared/state/session";
import { logEvent } from "@/shared/lib/audit";
import { getProfile, type Profile } from "@/services/storage/profile";
import Logo from "@/shared/ui/Logo";

const navItems = [
  { label: "Chats", to: "/" },
  { label: "Projects", to: "/system", systemTab: "projects" as const },
  { label: "Library", to: "/system", systemTab: "library" as const },
  { label: "System", to: "/system" },
  { label: "Pricing", to: "/pricing" },
  { label: "Settings", to: "/settings/appearance" }
];

export function AppShell() {
  const setProfileOpen = useUIStore((state) => state.setProfileOpen);
  const setSystemTab = useUIStore((state) => state.setSystemTab);
  const createChat = useChatStore((state) => state.createChat);
  const setActiveChatId = useSessionStore((state) => state.setActiveChatId);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(() => getProfile());

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

  return (
    <TooltipProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-button focus:bg-accent-nexus focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div className="flex min-h-screen bg-app text-app" data-testid="app-shell">
        <aside className="hidden w-64 flex-col border-r border-app bg-surface p-6 shadow-ambient lg:flex">
          <div className="mb-8">
            <div className="flex min-h-[44px] items-center">
              <Logo height={24} />
            </div>
            <p className="mt-2 text-sm text-muted">Proof-first intelligence.</p>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => {
                  if (item.systemTab) {
                    setSystemTab(item.systemTab);
                  }
                }}
                className={({ isActive }) =>
                  `rounded-button px-3 py-2 text-sm transition ${isActive ? "bg-app text-app shadow-press" : "text-muted hover:text-app"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Button
            className="mt-6"
            onClick={() => {
              const chat = createChat();
              setActiveChatId(chat.id);
              navigate("/");
              logEvent("chat.newButton");
            }}
          >
            + New Chat
          </Button>
        </aside>

        <main className="flex flex-1 flex-col">
          <header className="flex items-center gap-4 border-b border-app bg-app px-6 py-4">
            <div className="flex min-h-[44px] items-center">
              <Logo height={24} />
            </div>
            <div className="hidden flex-1 items-center gap-2 lg:flex">
              <Input placeholder="Search…" aria-label="Search" className="max-w-sm" />
              <span className="text-xs text-muted">⌘K</span>
            </div>
            <div className="flex flex-1 items-center gap-2 lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" aria-label="Open navigation">
                    Menu
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <nav className="mt-4 flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          navigate(item.to);
                          if (item.systemTab) {
                            setSystemTab(item.systemTab);
                          }
                        }}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              <Input placeholder="Search…" aria-label="Search" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ModeToggle />
              <ThemeToggle />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open profile" onClick={() => setProfileOpen(true)}>
                    <Avatar className="h-8 w-8">
                      {profile.avatarUrl ? (
                        <AvatarImage src={profile.avatarUrl} alt="Profile avatar" />
                      ) : (
                        <AvatarFallback>{profile.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{profile.displayName}</TooltipContent>
              </Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setProfileOpen(true)}>Edit profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings/appearance")}>Settings</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <section id="main" className="flex flex-1 flex-col bg-surface p-6">
            <Suspense fallback={<div className="flex flex-1 items-center justify-center text-muted">Loading…</div>}>
              <Outlet />
            </Suspense>
          </section>
        </main>
      </div>
      <ProfileModal />
      <Toaster />
    </TooltipProvider>
  );
}
