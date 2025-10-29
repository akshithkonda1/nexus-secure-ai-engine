import { useEffect, useMemo } from "react";
import { BookOpen, BriefcaseBusiness, Cpu, Library, MessageCircle, Settings, Sparkles, SquarePlus } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/cn";
import { ModeToggle } from "@/features/mode/ModeToggle";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { ProfileModal } from "@/features/profile/ProfileModal";
import { Toaster } from "@/shared/ui/use-toast";
import { useUI, useUIStore } from "@/shared/state/ui";
import { createChat } from "@/services/storage/chats";
import { useSessionStore } from "@/shared/state/session";
import { SystemDrawer } from "@/features/system/SystemDrawer";
import { TooltipProvider } from "@/shared/ui/tooltip";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  onClick?: () => void;
}

export function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openProfile } = useUI();
  const setActivePane = useUIStore((state) => state.setActiveSystemPane);
  const setSystemDrawerOpen = useUIStore((state) => state.setSystemDrawerOpen);
  const openChat = useSessionStore((state) => state.openChat);
  const mode = useSessionStore((state) => state.mode);

  useEffect(() => {
    if (location.pathname === "/profile") {
      openProfile();
    }
  }, [location.pathname, openProfile]);

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: "Chats", icon: <MessageCircle className="h-4 w-4" />, to: "/" },
      {
        label: "Projects",
        icon: <BriefcaseBusiness className="h-4 w-4" />,
        to: "/",
        onClick: () => {
          setSystemDrawerOpen(true);
          setActivePane("projects");
        },
      },
      {
        label: "Library",
        icon: <Library className="h-4 w-4" />,
        to: "/",
        onClick: () => {
          setSystemDrawerOpen(true);
          setActivePane("library");
        },
      },
      {
        label: "Models",
        icon: <Cpu className="h-4 w-4" />,
        to: "/",
        onClick: () => {
          setSystemDrawerOpen(true);
          setActivePane("models");
        },
      },
      { label: "Pricing", icon: <Sparkles className="h-4 w-4" />, to: "/pricing" },
      { label: "Settings", icon: <Settings className="h-4 w-4" />, to: "/settings" },
    ],
    [setActivePane, setSystemDrawerOpen],
  );

  const handleNewChat = () => {
    const chat = createChat(mode);
    openChat(chat.id);
    navigate("/");
  };

  return (
    <TooltipProvider delayDuration={120}>
      <div className="bg-app text-base text-inherit">
        <div className="flex min-h-screen">
          <aside className="flex w-[260px] flex-col border-r border-subtle bg-surface/80 p-6 backdrop-blur-lg max-sm:hidden">
            <div className="mb-8 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wide text-muted">Nexus — Adaptive AI Workspace</span>
              <strong className="text-lg">Navigate the truth</strong>
            </div>
            <Button onClick={handleNewChat} variant="primary" className="mb-6 w-full">
              <SquarePlus className="h-4 w-4" /> New chat
            </Button>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={item.onClick}
                  className={({ isActive }) =>
                    cn(
                      "group inline-flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition hover:bg-accent-soft hover:text-white",
                      (isActive && item.to !== "/") || (item.to === "/" && location.pathname === "/")
                        ? "ring-2 ring-indigo-500/60 text-white bg-accent-soft"
                        : undefined,
                    )
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
          <div className="flex flex-1 flex-col">
            <header className="flex h-14 items-center justify-between border-b border-subtle bg-surface/70 px-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">Nexus.ai Workspace</span>
                <Input placeholder="Search (⌘K)" className="h-9 w-64" aria-label="Search" />
              </div>
              <div className="flex items-center gap-2">
                <ModeToggle />
                <ThemeToggle />
                <Button variant="ghost" size="sm" onClick={openProfile} aria-label="Open profile">
                  <BookOpen className="h-4 w-4" />
                </Button>
              </div>
            </header>
            <main className="flex flex-1">
              <div className="flex min-h-full flex-1 flex-col overflow-hidden">
                <Outlet />
              </div>
              <SystemDrawer />
            </main>
          </div>
          <ProfileModal />
          <Toaster />
        </div>
        <ProfileModal />
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
