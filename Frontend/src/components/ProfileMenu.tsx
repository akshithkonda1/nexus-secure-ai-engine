import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, LifeBuoy, LogOut, Settings, Share2, User } from "lucide-react";
import { useModal } from "@/state/useModal";

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

export function ProfileMenu({ className, user, onSignOut }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { open: openModal } = useModal();

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handlePointer);
    return () => window.removeEventListener("mousedown", handlePointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open]);

  const initials = useMemo(() => {
    if (user.avatarUrl) return "";
    const segments = user.name.trim().split(/\s+/);
    if (!segments.length) return "?";
    const first = segments[0]?.[0];
    const last = segments.length > 1 ? segments[segments.length - 1]?.[0] : segments[0]?.[1];
    const letters = [first, last].filter(Boolean).join("");
    return letters ? letters.toUpperCase() : "?";
  }, [user.avatarUrl, user.name]);

  const items = useMemo(
    () => [
      {
        id: "profile",
        label: "View profile",
        description: "Update your name, avatar, and credentials.",
        icon: User,
        onSelect: () => openModal("profile")
      },
      {
        id: "billing",
        label: "Billing & usage",
        description: "Join the billing preview waitlist.",
        icon: CreditCard,
        onSelect: () => openModal("billing-waitlist")
      },
      {
        id: "support",
        label: "Support",
        description: "Share product feedback with Nexus.",
        icon: LifeBuoy,
        onSelect: () => openModal("feedback")
      },
      {
        id: "refer",
        label: "Refer",
        description: "Invite teammates and earn credits soon.",
        icon: Share2,
        onSelect: () => openModal("refer")
      },
      {
        id: "settings",
        label: "Account settings",
        description: "Configure workspace defaults and access.",
        icon: Settings,
        onSelect: () => navigate("/settings")
      }
    ],
    [navigate, openModal]
  );

  async function handleSignOut() {
    if (!onSignOut) return;
    await onSignOut();
    setOpen(false);
  }

  return (
    <div ref={containerRef} className={className ? `${className} relative` : "relative"}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-3 py-1.5 text-left shadow-sm transition hover:border-[color:rgba(var(--ring)/.35)]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[rgb(var(--surface))] text-sm font-semibold text-[rgb(var(--text))]">
          {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : initials}
        </span>
        <span className="hidden text-sm leading-tight sm:block">
          <span className="block font-semibold">{user.name}</span>
          <span className="block text-[color:rgba(var(--text)/0.6)]">{user.email}</span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-3 w-80 rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-2 shadow-2xl"
        >
          <div className="rounded-xl bg-[rgb(var(--panel))] px-4 py-3 text-sm text-[color:rgba(var(--text)/0.65)]">
            <p className="font-semibold text-[rgb(var(--text))]">{user.name}</p>
            <p>{user.email}</p>
            {user.role && <p>{user.role}</p>}
          </div>

          <div className="mt-2 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    item.onSelect();
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[rgb(var(--panel))]"
                >
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[rgb(var(--panel))] text-[color:rgba(var(--text)/0.75)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm">
                    <span className="block font-medium text-[rgb(var(--text))]">{item.label}</span>
                    <span className="block text-[color:rgba(var(--text)/0.6)]">{item.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {onSignOut && (
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-red-500 transition hover:bg-[rgb(var(--panel))]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
