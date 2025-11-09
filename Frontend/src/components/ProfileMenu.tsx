import type { ComponentType, KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import {
  CreditCard,
  LifeBuoy,
  LogOut,
  Settings,
  User
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type ProfileMenuProps = {
  className?: string;
  user: {
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string | null;
  };
  onSignOut?: () => Promise<void> | void;
};

type MenuItem = {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  action: () => void;
};

export function ProfileMenu({ className, user, onSignOut }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const buttonId = useId();
  const navigate = useNavigate();

  const items: MenuItem[] = useMemo(
    () => [
      {
        id: "profile",
        label: "View profile",
        description: "Manage your personal details and security keys.",
        icon: User,
        action: () => navigate("/settings?section=profile")
      },
      {
        id: "settings",
        label: "Account settings",
        description: "Update workspace defaults, access, and notifications.",
        icon: Settings,
        action: () => navigate("/settings")
      },
      {
        id: "billing",
        label: "Billing & usage",
        description: "Review plan limits, invoices, and usage analytics.",
        icon: CreditCard,
        action: () => navigate("/settings?section=billing")
      },
      {
        id: "support",
        label: "Support",
        description: "Get help from the Nexus team and knowledge base.",
        icon: LifeBuoy,
        action: () => {
          window.open("https://support.nexus.ai", "_blank", "noopener,noreferrer");
        }
      }
    ],
    [navigate]
  );

  itemsRef.current.length = items.length;

  const initials = useMemo(() => {
    if (user.avatarUrl) return "";
    const segments = user.name.trim().split(/\s+/);
    if (!segments.length) return "?";
    const first = segments[0]?.[0];
    const last = segments.length > 1 ? segments[segments.length - 1]?.[0] : segments[0]?.[1];
    const letters = [first, last].filter(Boolean).join("");
    return letters ? letters.toUpperCase() : "?";
  }, [user.avatarUrl, user.name]);

  const closeMenu = useCallback(
    (focusButton = false) => {
      setOpen(false);
      if (focusButton) {
        requestAnimationFrame(() => {
          buttonRef.current?.focus({ preventScroll: true });
        });
      }
    },
    []
  );

  const focusItem = useCallback(
    (index: number) => {
      if (!items.length) return;
      const clamped = ((index % items.length) + items.length) % items.length;
      itemsRef.current[clamped]?.focus({ preventScroll: true });
      setHighlightedIndex(clamped);
    },
    [items.length]
  );

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent | PointerEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [closeMenu, open]);

  useEffect(() => {
    if (!open) return;
    const handleFocusOut = (event: FocusEvent) => {
      if (!containerRef.current) return;
      const related = event.relatedTarget as Node | null;
      if (related && containerRef.current.contains(related)) return;
      closeMenu();
    };
    const node = containerRef.current;
    node?.addEventListener("focusout", handleFocusOut);
    return () => node?.removeEventListener("focusout", handleFocusOut);
  }, [closeMenu, open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;
      switch (event.key) {
        case "Escape": {
          event.preventDefault();
          closeMenu(true);
          break;
        }
        case "ArrowDown": {
          event.preventDefault();
          focusItem(highlightedIndex + 1);
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          focusItem(highlightedIndex - 1);
          break;
        }
        case "Home": {
          event.preventDefault();
          focusItem(0);
          break;
        }
        case "End": {
          event.preventDefault();
          focusItem(items.length - 1);
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu, focusItem, highlightedIndex, items.length, open]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      focusItem(highlightedIndex);
    });
  }, [focusItem, highlightedIndex, open]);

  const handleToggle = () => {
    setHighlightedIndex(0);
    setOpen((value) => !value);
  };

  const handleButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      }
      requestAnimationFrame(() => {
        focusItem(event.key === "ArrowUp" ? items.length - 1 : 0);
      });
    }
  };

  const handleItemClick = (item: MenuItem) => {
    item.action();
    closeMenu();
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    let shouldRedirect = !onSignOut;
    try {
      if (onSignOut) {
        await onSignOut();
        shouldRedirect = false;
      } else {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include"
        }).catch(() => undefined);
        if (response && !response.ok && response.status >= 500) {
          console.error("Failed to sign out", response.statusText);
        }
        const dispatched = window.dispatchEvent(
          new CustomEvent("nexus:signout", { cancelable: true })
        );
        if (!dispatched) {
          shouldRedirect = false;
        } else {
          localStorage.removeItem("nexus.session");
        }
      }
    } catch (error) {
      console.error("Sign out action failed", error);
      shouldRedirect = false;
    } finally {
      setSigningOut(false);
      closeMenu();
      if (shouldRedirect) {
        window.location.assign("/");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
    >
      <button
        id={buttonId}
        ref={buttonRef}
        type="button"
        className={cn(
          "relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgb(var(--border)/0.4)] bg-[rgb(var(--surface)/0.9)] text-sm font-semibold text-[rgb(var(--text))] shadow-soft transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.55)]",
          open && "border-[color:var(--brand)] text-[color:var(--brand)]"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span aria-hidden className="text-base font-semibold">
            {initials}
          </span>
        )}
        <span className="sr-only">Open profile menu</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-labelledby={buttonId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-40 mt-4 w-80 origin-top-right rounded-3xl border border-[rgb(var(--border)/0.4)] bg-[rgb(var(--surface)/0.98)] p-4 text-[rgb(var(--text))] shadow-2xl backdrop-blur dark:border-[rgb(var(--border)/0.5)] dark:bg-[rgb(var(--surface)/0.72)]"
          >
            <div className="flex items-start gap-3 rounded-2xl bg-[rgb(var(--surface)/0.92)] px-4 py-4 dark:bg-[rgb(var(--surface)/0.5)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--brand)]/16 text-[color:var(--brand)]">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  <span className="text-base font-semibold">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[rgb(var(--text))]">{user.name}</p>
                <p className="truncate text-xs text-[rgb(var(--text)/0.65)]">{user.email}</p>
                {user.role ? (
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.22em] text-[rgb(var(--text)/0.45)]">
                    {user.role}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 space-y-1" role="none">
              {items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    ref={(node) => {
                      itemsRef.current[index] = node;
                    }}
                    type="button"
                    role="menuitem"
                    className="group flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-[rgb(var(--surface)/0.94)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] dark:hover:bg-[rgb(var(--surface)/0.45)]"
                    onClick={() => handleItemClick(item)}
                    onFocus={() => setHighlightedIndex(index)}
                  >
                    <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--brand)]/18 text-[color:var(--brand)] transition group-hover:bg-[color:var(--brand)] group-hover:text-white">
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-[rgb(var(--text))]">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs text-[rgb(var(--text)/0.6)]">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 border-t border-[rgb(var(--border)/0.35)] pt-4">
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center justify-between rounded-2xl bg-[color:var(--brand)]/12 px-4 py-3 text-sm font-semibold text-[color:var(--brand)] transition hover:bg-[color:var(--brand)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--brand)]"
                onClick={handleSignOut}
                disabled={signingOut}
                aria-disabled={signingOut}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4.5 w-4.5" />
                  {signingOut ? "Signing out…" : "Sign out"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProfileMenu;
