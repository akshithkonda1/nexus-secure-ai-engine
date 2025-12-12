import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import logo from "@/assets/ryuzen-dragon.svg";
import HomeIcon from "@/assets/icons/home.svg";
import ToronIcon from "@/assets/icons/toron.svg";
import WorkspaceIcon from "@/assets/icons/workspace.svg";
import DocumentsIcon from "@/assets/icons/documents.svg";
import HistoryIcon from "@/assets/icons/history.svg";
import SettingsIcon from "@/assets/icons/settings.svg";
import { useFeedback } from "@/state/feedback";

type NavItem = { label: string; path: string; icon: string | JSX.Element };

const navItems: NavItem[] = [
  { label: "Home", path: "/", icon: HomeIcon },
  { label: "Toron", path: "/toron", icon: ToronIcon },
  { label: "Workspace", path: "/workspace", icon: WorkspaceIcon },
  { label: "Projects", path: "/projects", icon: WorkspaceIcon },
  { label: "Documents", path: "/documents", icon: DocumentsIcon },
  { label: "History", path: "/history", icon: HistoryIcon },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
];

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
      } h-screen flex-col border-r border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_88%,transparent)] px-3 pb-6 pt-5 shadow-[0_10px_60px_rgba(0,0,0,0.45)]`}
    >
      <div className="flex items-center justify-between px-2 pb-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Ryuzen" className="h-9 w-9" />
          {!collapsed && (
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Ryuzen</p>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Workspace</p>
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
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={() => {
              if (onNavigate) onNavigate();
            }}
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4 }}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border border-transparent px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-[color-mix(in_srgb,var(--accent-primary)_60%,transparent)] text-[var(--text-primary)] shadow-[0_8px_28px_rgba(124,93,255,0.24)]"
                    : "text-[var(--text-secondary)] hover:border-[var(--border-soft)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_70%,transparent)]">
                  {typeof item.icon === "string" ? (
                    <img src={item.icon} alt={item.label} className="h-6 w-6 opacity-90" />
                  ) : (
                    <span className="text-[var(--text-primary)]">{item.icon}</span>
                  )}
                  {isActive && <GlowOverlay />}
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
                {isActive && <ActiveGlow />}
              </motion.div>
            )}
          </NavLink>
        ))}
        <div className="mt-2 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_82%,transparent)] p-3">
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

function GlowOverlay() {
  return (
    <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_50%,rgba(124,93,255,0.25),transparent_60%)] blur-md" />
  );
}

function ActiveGlow() {
  return (
    <motion.span
      layoutId="sidebar-active"
      className="absolute inset-0 -z-10 rounded-xl bg-[color-mix(in_srgb,var(--accent-secondary)_12%,transparent)] shadow-[0_0_30px_rgba(124,93,255,0.15)]"
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    />
  );
}
