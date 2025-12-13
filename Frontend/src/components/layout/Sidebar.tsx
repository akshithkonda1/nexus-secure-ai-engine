import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  Clock3,
  FileText,
  Folder,
  Grid,
  Home,
  Settings,
  Sparkles,
} from "lucide-react";

import { RyuzenLogoBadge } from "@/components/RyuzenBrandmark";
import { useFeedback } from "@/state/feedback";

type NavItem = { label: string; path: string; icon: typeof Home; isToron?: boolean };

const primaryNavItems: NavItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "Toron", path: "/toron", icon: Sparkles, isToron: true },
  { label: "Workspace", path: "/workspace", icon: Grid },
  { label: "Projects", path: "/projects", icon: Folder },
  { label: "Documents", path: "/documents", icon: FileText },
  { label: "History", path: "/history", icon: Clock3 },
];

const secondaryNavItems: NavItem[] = [{ label: "Settings", path: "/settings", icon: Settings }];

export function Sidebar({
  collapsed,
  onToggle,
  mobileVisible = false,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileVisible?: boolean;
  onNavigate?: () => void;
}) {
  const { openModal } = useFeedback();

  return (
    <motion.aside
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -16, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`${collapsed ? "w-[86px]" : "w-[var(--sidebar-width)]"} fixed left-0 top-0 z-30 ${
        mobileVisible ? "flex" : "hidden lg:flex"
      } h-screen flex-col panel-edge-dissolve-left px-3 pb-6 pt-5 backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between px-2 pb-6">
        <div className="flex items-center gap-3">
          <RyuzenLogoBadge size={48} />
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-secondary)]">RYUZEN Operations</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">RYUZEN OS V2 – Unified Control</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_75%,transparent)] text-[var(--text-secondary)] transition hover:-translate-y-[1px] hover:text-[var(--text-primary)]"
          aria-label="Collapse sidebar"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {primaryNavItems.map((item) => (
          <NavigationLink key={item.path} collapsed={collapsed} item={item} onNavigate={onNavigate} />
        ))}

        <div className="h-4" />

        {secondaryNavItems.map((item) => (
          <NavigationLink key={item.path} collapsed={collapsed} item={item} onNavigate={onNavigate} />
        ))}

        <div className="mt-3 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_82%,transparent)] p-3">
          <button
            type="button"
            onClick={openModal}
            className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--accent-secondary)_32%,var(--border-soft))] bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] px-3 py-3 text-left text-sm font-semibold text-[var(--text-primary)] transition hover:-translate-y-[1px] hover:shadow-[0_10px_30px_rgba(34,211,238,0.22)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--accent-secondary)_18%,transparent)] text-[color-mix(in_srgb,var(--accent-secondary)_90%,var(--text-primary))] shadow-inner shadow-black/30">
              ✨
            </span>
            <div className="flex flex-col">
              <span>Send Feedback</span>
              <span className="text-xs font-normal text-[var(--text-secondary)]">Secure & anonymous</span>
            </div>
            <span
              className="absolute inset-px rounded-xl border border-[color-mix(in_srgb,var(--accent-primary)_28%,transparent)] blur-[1px]"
              aria-hidden
            />
          </button>
        </div>
      </nav>

      <div className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_86%,transparent)] p-3 text-[var(--text-secondary)]">
        <p className="text-xs uppercase tracking-[0.24em]">System</p>
        {!collapsed && (
          <p className="pt-2 text-sm font-semibold text-[var(--text-primary)]">Ambient telemetry is live.</p>
        )}
      </div>
    </motion.aside>
  );
}

function NavigationLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const iconSize = item.isToron ? 22 : 20;

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      onClick={() => {
        if (onNavigate) onNavigate();
      }}
      className="group"
    >
      {({ isActive }) => (
        <motion.div
          whileHover={{ x: collapsed ? 0 : 2 }}
          className={`relative flex items-center gap-2.5 rounded-full px-3 py-2 text-sm font-semibold transition duration-100 ${
            isActive
              ? "bg-[linear-gradient(140deg,color-mix(in_srgb,var(--panel-elevated)_90%,transparent),color-mix(in_srgb,var(--panel-strong)_86%,transparent))] text-[var(--text-primary)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              : "text-[color-mix(in_srgb,var(--text-secondary)_94%,transparent)] hover:text-[var(--text-primary)]"
          }`}
          style={{
            boxShadow: isActive
              ? item.isToron
                ? "0 10px 28px rgba(107, 232, 255, 0.16)"
                : "0 10px 28px rgba(124, 93, 255, 0.12)"
              : undefined,
          }}
        >
          <span
            className={`flex items-center transition duration-100 ${
              item.isToron ? "text-[color-mix(in_srgb,var(--accent-secondary)_95%,var(--text-primary))] drop-shadow-[0_0_12px_rgba(107,232,255,0.35)]" : "text-[color-mix(in_srgb,var(--text-secondary)_92%,transparent)]"
            } ${isActive ? "text-[var(--text-primary)]" : ""}`}
          >
            <Icon strokeWidth={1.6} size={iconSize} />
          </span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                key={`${item.path}-label`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="relative z-10"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
          {isActive && (
            <span className="pointer-events-none absolute inset-px -z-10 rounded-full bg-[radial-gradient(circle_at_50%_120%,color-mix(in_srgb,var(--accent-secondary)_12%,transparent),transparent)]" />
          )}
          {isActive && item.isToron && (
            <span className="pointer-events-none absolute inset-0 -z-10 rounded-full border border-[color-mix(in_srgb,var(--accent-secondary)_24%,transparent)]" />
          )}
        </motion.div>
      )}
    </NavLink>
  );
}
