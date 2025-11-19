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
import ryuzenDragon from "@/assets/ryuzen-dragon.svg";

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
          "fixed inset-0 z-30 bg-[rgba(var(--bg),0.82)] backdrop-blur-md transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        data-collapsed={collapsed ? "true" : "false"}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col overflow-visible border-r border-zora-border bg-[rgba(var(--panel),0.68)] bg-[color:color-mix(in_srgb,var(--zora-space)_78%,transparent)] bg-zora-space/80 px-3 py-4 backdrop-blur-xl backdrop-blur-2xl transition-[transform,width] duration-200 ease-out rounded-none shadow-zora-soft transition-shadow hover:shadow-zora-glow hover:border-white/10",
          collapsed ? "w-[72px]" : "w-72",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="mb-4 flex items-center gap-2 px-1 text-[rgb(var(--text))] font-semibold tracking-tight">
            <img
              src={ryuzenDragon}
              alt="Ryuzen logo"
              className="h-9 w-9 drop-shadow-[0_10px_30px_rgba(62,228,255,0.3)]"
            />
            {!collapsed && <img src={ryuzenDragon} alt="Ryuzen logo" className="h-5" />}
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

          <nav className="space-y-2 text-[rgba(var(--subtle),0.85)]">
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
              <div className="pt-4 pb-1 text-[11px] uppercase tracking-[0.14em] text-[rgba(var(--subtle),0.72)]">
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
              <div className="rounded-[24px] border border-zora-border bg-[color:color-mix(in_srgb,var(--zora-space)_84%,transparent)] p-5 text-zora-white shadow-zora-soft backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zora-muted">Plan</p>
                <h3 className="mt-2 text-lg font-semibold text-zora-white">Professional</h3>
                <p className="mt-1 text-sm text-zora-muted">
                  Unlock orchestration across teams with unlimited workspaces.
                </p>
                <button
                  type="button"
                  className="btn btn-primary mt-4 w-full justify-center shadow-zora-glow"
                  onClick={() => requestBillingUpgrade()}
                >
                  Upgrade
                </button>
              </div>
              <div className="rounded-[24px] border border-zora-border bg-[color:color-mix(in_srgb,var(--zora-soft)_80%,transparent)] p-4 text-xs text-zora-muted shadow-zora-soft backdrop-blur-xl">
                <p className="font-semibold text-zora-white">Ryuzen HQ</p>
                <p className="mt-1 leading-relaxed">
                  Compliance-friendly workspace for secure agent collaboration. Last synced 2 mins ago.
                </p>
                <button
                  type="button"
                  onClick={() => requestProjectCreation()}
                  className="btn btn-primary mt-3 w-full justify-center text-[11px] uppercase tracking-[0.2em] shadow-zora-glow"
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
