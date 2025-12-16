import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, Layout, Settings } from "lucide-react";
import { motion } from "framer-motion";

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

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex h-full w-60 flex-col justify-between border-r border-[var(--line-subtle)] bg-[var(--layer-surface)] px-5 py-8"
    >
      <div className="space-y-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ryuzen-dodger)] to-[var(--ryuzen-purple)]">
            <DragonLogo />
          </div>
          <span className="text-lg font-semibold text-[var(--text-strong)]">Ryuzen</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to}>
                <motion.div
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-[var(--layer-muted)] text-[var(--text-strong)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]"
                  }`}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span
                    className={`h-10 w-1 rounded-full transition-colors ${active ? "bg-[var(--accent)]" : "bg-transparent"}`}
                    aria-hidden
                  />
                  <Icon className="h-5 w-5 text-[var(--text-primary)]" aria-hidden />
                  <span className="tracking-normal">{item.label}</span>
                </motion.div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <nav className="border-t border-[var(--line-subtle)] pt-6">
        <NavLink to="/settings">
          <motion.div
            className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              location.pathname === "/settings"
                ? "bg-[var(--layer-muted)] text-[var(--text-strong)]"
                : "text-[var(--text-muted)] hover:bg-[var(--layer-muted)] hover:text-[var(--text-primary)]"
            }`}
            whileHover={{ x: 2 }}
          >
            <span
              className={`h-10 w-1 rounded-full transition-colors ${
                location.pathname === "/settings" ? "bg-[var(--accent)]" : "bg-transparent"
              }`}
              aria-hidden
            />
            <Settings className="h-5 w-5 text-[var(--text-primary)]" aria-hidden />
            <span>Settings</span>
          </motion.div>
        </NavLink>
      </nav>
    </motion.aside>
  );
}
