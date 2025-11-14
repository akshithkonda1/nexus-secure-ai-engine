import {
  Book,
  FileText,
  Folder,
  Grid,
  History,
  MessageCircle,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";

import NavItem from "@/components/nav/NavItem";
import { useSidebar } from "@/components/layout/sidebar/SidebarContext";
import { cn } from "@/shared/lib/cn";
import { requestBillingUpgrade, requestProjectCreation } from "@/lib/actions";
import zoraLogo from "@/assets/zora-logo.svg";
import zoraMark from "@/assets/zora-mark.svg";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const primaryNav = [
  { to: "/", label: "Overview", icon: Grid },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/outbox", label: "Workspace", icon: Folder },
  { to: "/templates", label: "Templates", icon: Sparkles },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/history", label: "Activity", icon: History },
];

const supportNav = [
  { to: "/governance", label: "Governance", icon: Shield },
  { to: "/guides", label: "Guides", icon: Book },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { collapsed, toggle } = useSidebar();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-zora-night/80 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        data-collapsed={collapsed ? "true" : "false"}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col overflow-visible border-r border-zora-border bg-zora-space/70 px-3 py-4 backdrop-blur-xl transition-[transform,width] duration-200 ease-out",
          collapsed ? "w-[72px]" : "w-72",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="mb-4 flex items-center gap-2 px-1 text-zora-white">
            <img src={zoraMark} alt="Zora" className="h-9 w-9" />
            {!collapsed && <img src={zoraLogo} alt="Zora" className="h-5" />}
            <button
              type="button"
              className={cn(
                "ml-auto nav-icon transition-transform",
                collapsed ? "rotate-180" : "",
              )}
              aria-label={collapsed ? "Expand menu" : "Collapse menu"}
              aria-expanded={!collapsed}
              onClick={toggle}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {primaryNav.map(({ to, label, icon: Icon }) => (
              <NavItem
                key={to}
                to={to}
                label={label}
                icon={<Icon className="size-4" />}
                onNavigate={onClose}
              />
            ))}

            {!collapsed && (
              <div className="pt-4 pb-1 text-[11px] uppercase tracking-[0.14em] text-zora-muted">
                Workspace
              </div>
            )}

            {supportNav.map(({ to, label, icon: Icon }) => (
              <NavItem
                key={to}
                to={to}
                label={label}
                icon={<Icon className="size-4" />}
                onNavigate={onClose}
              />
            ))}
          </nav>

          {!collapsed && (
            <div className="mt-auto space-y-4 pt-6">
              <div className="rounded-zora-xl border border-zora-border bg-zora-space/80 p-5 text-zora-white shadow-zora-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zora-muted">Plan</p>
                <h3 className="mt-2 text-lg font-semibold text-zora-white">Professional</h3>
                <p className="mt-1 text-sm text-zora-muted">
                  Unlock orchestration across teams with unlimited workspaces.
                </p>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-zora-lg px-4 py-2.5 bg-zora-aurora text-zora-night font-semibold shadow-zora-glow transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-zora-glow hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99]"
                  onClick={() => requestBillingUpgrade()}
                >
                  Upgrade
                </button>
              </div>
              <div className="rounded-zora-lg border border-zora-border bg-zora-space/60 p-4 text-xs text-zora-muted">
                <p className="font-semibold text-zora-white">Zora HQ</p>
                <p className="mt-1 leading-relaxed">
                  Compliance-friendly workspace for secure agent collaboration. Last synced 2 mins ago.
                </p>
                <button
                  type="button"
                  onClick={() => requestProjectCreation()}
                  className="mt-3 inline-flex items-center justify-center rounded-zora-lg px-4 py-2.5 bg-zora-aurora text-zora-night font-semibold shadow-zora-glow transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-zora-glow hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99] text-xs uppercase tracking-[0.2em]"
                >
                  New project
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
