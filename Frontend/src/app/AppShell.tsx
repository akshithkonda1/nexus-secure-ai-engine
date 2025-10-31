import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Menu, MessageSquarePlus, Search, Settings, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ModeToggle } from "@/features/mode/ModeToggle";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { ProfileModal } from "@/features/profile/ProfileModal";
import { ChatList } from "@/features/chat/ChatList";
import { SystemDrawer } from "@/features/system/SystemDrawer";
import { useUIStore } from "@/shared/state/ui";
import { useSessionStore } from "@/shared/state/session";
import {
  archiveChat,
  createChat,
  deletePermanent,
  listChats,
  moveToTrash,
  restoreFromTrash,
  type ChatThread,
} from "@/services/storage/chats";
import { getStoredProfile, type StoredProfile } from "@/services/storage/profile";
import { cn } from "@/shared/lib/cn";
import { track } from "@/shared/lib/analytics";

export interface AppOutletContext {
  chats: ChatThread[];
  refreshChats: () => void;
  createAndOpenChat: () => ChatThread;
  selectChat: (chatId: string) => void;
}

export function useAppContext(): AppOutletContext {
  return useOutletContext<AppOutletContext>();
}

export function AppShell(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const openProfileModal = useUIStore((state) => state.openProfileModal);
  const openSystemDrawer = useUIStore((state) => state.openSystemDrawer);
  const addOpenChatId = useSessionStore((state) => state.addOpenChatId);
  const setActiveChatId = useSessionStore((state) => state.setActiveChatId);
  const activeChatId = useSessionStore((state) => state.activeChatId);
  const closeOpenChatId = useSessionStore((state) => state.closeOpenChatId);

  const [profile, setProfile] = useState<StoredProfile>(() => getStoredProfile());
  const [navSheetOpen, setNavSheetOpen] = useState(false);
  const [chats, setChats] = useState<ChatThread[]>(() => sortChats(listChats()));

  const refreshChats = useCallback(() => {
    setChats(sortChats(listChats()));
  }, []);

  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      const first = chats[0];
      setActiveChatId(first.id);
      addOpenChatId(first.id);
    }
  }, [activeChatId, addOpenChatId, chats, setActiveChatId]);

  useEffect(() => {
    const listener = () => {
      setProfile(getStoredProfile());
    };

    window.addEventListener("nexus-profile-updated", listener);
    return () => {
      window.removeEventListener("nexus-profile-updated", listener);
    };
  }, []);

  useEffect(() => {
    track("route_change", { path: location.pathname, search: location.search });
  }, [location.pathname, location.search]);

  const isSystemRoute = location.pathname.startsWith("/system");

  const createAndOpenChat = useCallback(() => {
    const chat = createChat();
    refreshChats();
    addOpenChatId(chat.id);
    setActiveChatId(chat.id);
    return chat;
  }, [addOpenChatId, refreshChats, setActiveChatId]);

  const selectChat = useCallback(
    (chatId: string) => {
      addOpenChatId(chatId);
      setActiveChatId(chatId);
      if (location.pathname !== "/") {
        navigate("/");
      }
    },
    [addOpenChatId, setActiveChatId, navigate, location.pathname]
  );

  const handleArchive = useCallback(
    (chatId: string) => {
      archiveChat(chatId);
      closeOpenChatId(chatId);
      refreshChats();
    },
    [closeOpenChatId, refreshChats]
  );

  const handleMoveToTrash = useCallback(
    (chatId: string) => {
      moveToTrash(chatId);
      closeOpenChatId(chatId);
      refreshChats();
    },
    [closeOpenChatId, refreshChats]
  );

  const handleRestore = useCallback(
    (chatId: string) => {
      restoreFromTrash(chatId);
      refreshChats();
    },
    [refreshChats]
  );

  const handleDelete = useCallback(
    (chatId: string) => {
      deletePermanent(chatId);
      closeOpenChatId(chatId);
      refreshChats();
    },
    [closeOpenChatId, refreshChats]
  );

  const navItems = useMemo(
    () => [
      { label: "Chats", to: "/", icon: <MessageSquarePlus className="mr-2 h-4 w-4" /> },
      {
        label: "System",
        to: "/system?tab=library",
        icon: <Sparkles className="mr-2 h-4 w-4" />,
      },
      {
        label: "System Drawer",
        to: "/",
        icon: <Sparkles className="mr-2 h-4 w-4" />,
        onSelect: () => openSystemDrawer("source"),
      },
      { label: "Pricing", to: "/pricing", icon: <Sparkles className="mr-2 h-4 w-4" /> },
      { label: "Settings", to: "/settings", icon: <Settings className="mr-2 h-4 w-4" /> },
    ],
    [openSystemDrawer]
  );

  const appOutletContext: AppOutletContext = useMemo(
    () => ({ chats, refreshChats, createAndOpenChat, selectChat }),
    [chats, refreshChats, createAndOpenChat, selectChat]
  );

  return (
    <div className="flex min-h-screen bg-app text-primary">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--app-surface)] focus:px-4 focus:py-2 focus:shadow-ambient"
      >
        Skip to content
      </a>
      <DesktopSidebar
        profile={profile}
        chats={chats}
        navItems={navItems}
        onCreateChat={createAndOpenChat}
        onSelectChat={selectChat}
        onArchive={handleArchive}
        onTrash={handleMoveToTrash}
        onRestore={handleRestore}
        onDelete={handleDelete}
        currentPath={location.pathname + location.search}
      />

      <main id="main-content" className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-subtle bg-[var(--app-surface)]/90 px-4 shadow-ambient">
          <div className="flex items-center gap-3">
            <Button className="round-btn lg:hidden" size="icon" variant="ghost" onClick={() => setNavSheetOpen(true)} aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="hidden text-sm font-semibold text-muted sm:inline-flex">Nexus — Adaptive AI Workspace</span>
            <div className="relative hidden items-center md:flex">
              <Search className="absolute left-3 h-4 w-4 text-muted" />
              <Input className="h-10 w-64 pl-10 round-input" placeholder="Search (⌘K)" aria-label="Search workspace" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <ThemeToggle />
            {!isSystemRoute ? (
              <Button
                variant="ghost"
                className="hidden round-btn shadow-press xl:inline-flex"
                onClick={() => openSystemDrawer()}
                aria-label="Open system drawer"
              >
                System Drawer
              </Button>
            ) : null}
            <ProfileMenu profile={profile} onOpenProfile={openProfileModal} />
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Outlet context={appOutletContext} />
          </div>
          {!isSystemRoute ? <SystemDrawer /> : null}
        </div>
      </main>

      {navSheetOpen ? (
        <MobileSidebarSheet
          open={navSheetOpen}
          onOpenChange={setNavSheetOpen}
          profile={profile}
          navItems={navItems}
          chats={chats}
          currentPath={location.pathname + location.search}
          onCreateChat={createAndOpenChat}
          onSelectChat={(id) => {
            selectChat(id);
            setNavSheetOpen(false);
          }}
          onArchive={handleArchive}
          onTrash={handleMoveToTrash}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      ) : null}

      <ProfileModal onProfileChange={setProfile} />
    </div>
  );
}

interface NavItem {
  label: string;
  to: string;
  icon: JSX.Element;
  onSelect?: () => void;
}

interface SidebarProps {
  profile: StoredProfile;
  navItems: NavItem[];
  chats: ChatThread[];
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  onArchive: (chatId: string) => void;
  onTrash: (chatId: string) => void;
  onRestore: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  currentPath: string;
}

function DesktopSidebar({
  profile,
  navItems,
  chats,
  onSelectChat,
  onCreateChat,
  onArchive,
  onTrash,
  onRestore,
  onDelete,
  currentPath,
}: SidebarProps) {
  const openProfileModal = useUIStore((state) => state.openProfileModal);
  const activeChatId = useSessionStore((state) => state.activeChatId);

  return (
    <aside className="hidden w-[260px] flex-col border-r border-subtle bg-[var(--app-surface)]/80 backdrop-blur lg:flex">
      <div className="flex h-20 items-center justify-between px-5">
        <div>
          <Link to="/" className="flex items-baseline gap-2 text-lg font-semibold">
            Nexus
          </Link>
          <p className="text-xs text-muted">Adaptive AI Workspace</p>
        </div>
        <Button size="icon" variant="outline" className="round-btn shadow-press" onClick={onCreateChat} aria-label="New chat">
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isRouteMatch = !item.onSelect && item.to === currentPath;
          return (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              className={cn(
                "justify-start round-btn text-sm",
                isRouteMatch ? "bg-[var(--app-muted)]" : undefined
              )}
            >
              <Link
                to={item.to}
                onClick={() => {
                  item.onSelect?.();
                }}
                aria-current={isRouteMatch ? "page" : undefined}
              >
                {item.icon}
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
      <Separator className="my-4" />
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={onSelectChat}
          onArchive={onArchive}
          onTrash={onTrash}
          onRestore={onRestore}
          onDelete={onDelete}
        />
      </div>
      <Separator className="my-4" />
      <div className="flex items-center gap-3 px-4 pb-5">
        <Avatar className="h-12 w-12 shadow-ambient">
          {profile.avatarDataUrl ? <AvatarImage src={profile.avatarDataUrl} alt={profile.displayName} /> : null}
          <AvatarFallback>{profile.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{profile.displayName}</p>
          <Button variant="link" className="px-0 text-xs" onClick={openProfileModal}>
            Manage profile
          </Button>
        </div>
      </div>
    </aside>
  );
}

function MobileSidebarSheet({
  open,
  onOpenChange,
  profile,
  navItems,
  chats,
  currentPath,
  onSelectChat,
  onCreateChat,
  onArchive,
  onTrash,
  onRestore,
  onDelete,
}: SidebarProps & { open: boolean; onOpenChange: (next: boolean) => void }) {
  const activeChatId = useSessionStore((state) => state.activeChatId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[260px] border-r border-subtle bg-[var(--app-surface)] p-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">Navigate Nexus</span>
          <Button size="icon" variant="ghost" className="round-btn" onClick={() => onOpenChange(false)} aria-label="Close navigation">
            ✕
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="default" className="round-btn shadow-press" onClick={() => onCreateChat()}>
            <MessageSquarePlus className="mr-2 h-4 w-4" /> New Chat
          </Button>
          {navItems.map((item) => {
            const isRouteMatch = !item.onSelect && item.to === currentPath;
            return (
              <Button
                key={item.label}
                asChild
                variant="ghost"
                className={cn("justify-start round-btn", isRouteMatch ? "bg-[var(--app-muted)]" : undefined)}
              >
                <Link
                  to={item.to}
                  onClick={() => {
                    onOpenChange(false);
                    item.onSelect?.();
                  }}
                  aria-current={isRouteMatch ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </div>
        <Separator className="my-4" />
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={(id) => {
            onSelectChat(id);
            onOpenChange(false);
          }}
          onArchive={onArchive}
          onTrash={onTrash}
          onRestore={onRestore}
          onDelete={onDelete}
        />
        <Separator className="my-4" />
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            {profile.avatarDataUrl ? <AvatarImage src={profile.avatarDataUrl} alt={profile.displayName} /> : null}
            <AvatarFallback>{profile.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{profile.displayName}</p>
            <p className="text-xs text-muted">Tap profile menu to update</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ProfileMenu({ profile, onOpenProfile }: { profile: StoredProfile; onOpenProfile: () => void }) {
  const [isOpen, setOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="round-btn shadow-press" aria-expanded={isOpen}>
          <Avatar className="h-8 w-8">
            {profile.avatarDataUrl ? <AvatarImage src={profile.avatarDataUrl} alt={profile.displayName} /> : null}
            <AvatarFallback>{profile.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="ml-2 hidden text-sm font-medium md:inline-flex">{profile.displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="round-card shadow-ambient">
        <DropdownMenuLabel className="text-xs uppercase text-muted">Workspace</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onOpenProfile}>Profile</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setOpen(false)}>Sign out (stub)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function sortChats(chats: ChatThread[]): ChatThread[] {
  return [...chats].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
