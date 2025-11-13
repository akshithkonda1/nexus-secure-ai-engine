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
          "fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        data-collapsed={collapsed ? "true" : "false"}
        className={cn(
          "glass-surface fixed left-0 top-0 z-40 flex h-full flex-col overflow-visible px-3 py-4 transition-[transform,width] duration-200 ease-out",
          collapsed ? "w-[72px]" : "w-72",
          "lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="mb-4 flex items-center gap-2 px-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#009EFF] to-[#9360FF]" />
            {!collapsed && <div className="text-sm font-semibold tracking-wide">NEXUS</div>}
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
              <div className="pt-4 pb-1 text-[11px] tracking-[0.14em] uppercase text-slate-500 dark:text-slate-400">
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
              <div className="rounded-3xl bg-[linear-gradient(140deg,rgba(var(--glow-blue),0.55)_0%,rgba(var(--glow-purple),0.45)_100%)] p-5 text-[rgb(var(--surface))] shadow-[0_20px_45px_rgba(2,6,23,0.25)]">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/70">Plan</p>
                <h3 className="mt-2 text-lg font-semibold">Professional</h3>
                <p className="mt-1 text-sm text-white/85">
                  Unlock orchestration across teams with unlimited workspaces.
                </p>
                <button
                  type="button"
                  className="mt-4 btn btn-primary btn-neo ripple rounded-2xl"
                  onClick={() => requestBillingUpgrade()}
                >
                  Upgrade
                </button>
              </div>
              <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.9)] p-4 text-xs text-[rgb(var(--muted))] dark:bg-[rgba(var(--surface),0.3)]">
                <p className="font-semibold text-[rgb(var(--text))]">Nexus HQ</p>
                <p className="mt-1 leading-relaxed text-[rgb(var(--muted))]">
                  Compliance-friendly workspace for secure agent collaboration. Last synced 2 mins ago.
                </p>
                <button
                  type="button"
                  onClick={() => requestProjectCreation()}
                  className="mt-3 btn btn-primary btn-neo ripple text-xs uppercase tracking-[0.2em]"
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
