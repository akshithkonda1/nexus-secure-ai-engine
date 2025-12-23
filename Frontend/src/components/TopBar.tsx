import { useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Zap, HelpCircle, PanelLeft, PanelRight, LogOut, User, Settings } from "lucide-react";
import { cn, bg, text, border } from "../utils/theme";
import { useAuth } from "../context/AuthContext";

const labels: Record<string, string> = {
  "/": "Home",
  "/toron": "Toron",
  "/workspace": "Workspace",
  "/settings": "Settings",
  "/projects": "Projects",
  "/templates": "Templates",
  "/documents": "Documents",
  "/community": "Community",
  "/history": "History",
  "/help": "Help",
};

type TopBarProps = {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
};

export default function TopBar({ onToggleSidebar, sidebarCollapsed = false }: TopBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => labels[location.pathname] ?? "Home", [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggleSidebar?.()}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm backdrop-blur-sm transition",
            border.subtle,
            bg.surface,
            text.muted,
            "hover:border-[var(--line-strong)] hover:text-[var(--text)]"
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </button>
        <h2 className={cn("text-lg font-semibold", text.primary)}>{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <button
          className={cn(
            "group relative flex items-center gap-2 overflow-hidden rounded-lg px-4 py-1.5 text-sm font-semibold shadow-sm transition-all hover:shadow-md",
            bg.accent,
            text.inverse
          )}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Upgrade</span>
        </button>
        <button
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            text.muted,
            "hover:text-[var(--text)]"
          )}
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shadow-inner transition-all hover:ring-2 hover:ring-[var(--accent)]",
              bg.elevated,
              text.primary
            )}
            aria-label="user menu"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials(user?.name || "User")
            )}
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div
              className={cn(
                "absolute right-0 top-full mt-2 w-56 rounded-lg border shadow-lg",
                bg.surface,
                border.subtle
              )}
            >
              <div className="p-3 border-b border-[var(--line-subtle)]">
                <p className={cn("font-medium text-sm", text.primary)}>{user?.name}</p>
                <p className={cn("text-xs truncate", text.muted)}>{user?.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/settings");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                    text.primary,
                    "hover:bg-[var(--layer-elevated)]"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/settings");
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                    text.primary,
                    "hover:bg-[var(--layer-elevated)]"
                  )}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </button>
              </div>

              <div className="border-t border-[var(--line-subtle)] py-1">
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
