import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, Layout, Settings, Sun, Moon, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../theme/ThemeProvider";

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Toron", to: "/toron", icon: MessageSquare },
  { label: "Workspace", to: "/workspace", icon: Layout },
];

// Dragon logo SVG component with gradient
function DragonLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
      <defs>
        <linearGradient id="dragon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--ryuzen-dodger)" />
          <stop offset="100%" stopColor="var(--ryuzen-purple)" />
        </linearGradient>
      </defs>
      {/* Dragon silhouette */}
      <path
        d="M20 4C18 4 16 5 15 7L12 12C11 14 10 16 11 18C11.5 19 12.5 19.5 14 19.5C14 20 14 21 15 22C16 23 17.5 23.5 19 23.5C19 25 19.5 27 21 28.5C22.5 30 25 31 27 30.5C28.5 30 29.5 28.5 30 27C30.5 25.5 30.5 24 30 22.5C31 22 32 21 32.5 19.5C33 18 33 16 31.5 14.5C30 13 28 12.5 26 13C26 11.5 25.5 10 24 9C22.5 8 21 7.5 20 4Z"
        fill="url(#dragon-gradient)"
      />
      {/* Dragon eye */}
      <circle cx="23" cy="15" r="1.5" fill="white" />
      {/* Dragon details */}
      <path
        d="M15 19C15.5 18 16 17 17 16.5M20 23.5C21 24 22 24.5 23 24.5M27 28C28 27 28.5 26 29 25"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const { mode, setMode } = useTheme();

  const toggleTheme = (newMode: "light" | "dark") => {
    setMode(newMode);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex w-64 flex-col justify-between gap-6 rounded-3xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-4 py-6 shadow-lg"
    >
      <div className="space-y-6">
        {/* Logo and Brand */}
        <motion.div
          className="flex items-center gap-3 px-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] shadow-md">
            <DragonLogo />
          </div>
          <span className="bg-gradient-to-r from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] bg-clip-text text-lg font-bold text-transparent">
            Ryuzen
          </span>
        </motion.div>

        {/* Search */}
        <div className="px-2">
          <motion.div
            className="flex items-center gap-2 rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-3 py-2 transition-all duration-200 hover:border-[var(--accent)] focus-within:border-[var(--accent)] focus-within:shadow-sm"
            whileHover={{ scale: 1.01 }}
          >
            <Search className="h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search"
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
            <kbd className="rounded bg-[var(--layer-surface)] px-1.5 py-0.5 text-xs text-[var(--text-muted)]">⌘K</kbd>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to}>
                <motion.div
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-[var(--ryuzen-dodger)]/10 to-[var(--ryuzen-purple)]/10 text-[var(--text-strong)] shadow-sm"
                      : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]"
                  }`}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-[var(--ryuzen-azure)]" : ""}`} aria-hidden />
                  <span>{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="active-nav"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="space-y-4 border-t border-[var(--line-subtle)] pt-4">
        {/* Settings link */}
        <nav className="flex flex-col gap-1 px-2">
          <NavLink to="/settings">
            <motion.div
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                location.pathname === "/settings"
                  ? "bg-gradient-to-r from-[var(--ryuzen-dodger)]/10 to-[var(--ryuzen-purple)]/10 text-[var(--text-strong)] shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]"
              }`}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="h-[18px] w-[18px]" aria-hidden />
              <span>Settings</span>
            </motion.div>
          </NavLink>
        </nav>

        {/* Theme toggle */}
        <div className="flex items-center gap-2 px-2">
          <motion.button
            onClick={() => toggleTheme("light")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
              mode === "light"
                ? "bg-gradient-to-r from-[var(--ryuzen-dodger)]/20 to-[var(--ryuzen-purple)]/20 text-[var(--text-strong)] shadow-sm"
                : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
          </motion.button>
          <motion.button
            onClick={() => toggleTheme("dark")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
              mode === "dark"
                ? "bg-gradient-to-r from-[var(--ryuzen-dodger)]/20 to-[var(--ryuzen-purple)]/20 text-[var(--text-strong)] shadow-sm"
                : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
          </motion.button>
        </div>

        {/* User profile */}
        <motion.div
          className="flex items-center gap-3 rounded-lg border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-3 py-2.5 transition-all duration-200 hover:border-[var(--accent)] hover:shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)] text-sm font-semibold text-white shadow-md">
            EC
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--text-strong)]">Emilia Caitin</div>
            <div className="text-xs text-[var(--text-muted)]">hey@nuance.agency</div>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
