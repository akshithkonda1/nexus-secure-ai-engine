import { NavLink } from "react-router-dom";
import {
  MessageCircle,
  Folder,
  FileText,
  BarChart3,
  History,
  Settings,
  Sparkles,
  Send,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "@/theme/useTheme";
import { useState } from "react";

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const items = [
    { label: "Chat", to: "/chat", icon: <MessageCircle className="w-5 h-5" /> },
    { label: "Projects", to: "/projects", icon: <Folder className="w-5 h-5" /> },
    { label: "Templates", to: "/templates", icon: <Sparkles className="w-5 h-5" /> },
    { label: "Documents", to: "/documents", icon: <FileText className="w-5 h-5" /> },
    { label: "Analytics", to: "/analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { label: "History", to: "/history", icon: <History className="w-5 h-5" /> },
    { label: "Settings", to: "/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <aside
      className={`fixed top-0 left-0 h-full flex flex-col justify-between transition-all duration-300 border-r border-border/40 ${
        isCollapsed ? "w-20" : "w-64"
      } bg-[var(--nexus-surface)]`}
    >
      {/* ——— HEADER ——— */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border/50">
        <h1
          className={`text-lg font-semibold tracking-tight ${
            isCollapsed ? "hidden" : "block"
          }`}
        >
          Nexus <span className="text-xs text-gray-400 ml-1">BETA</span>
        </h1>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-md hover:bg-[var(--nexus-card)] p-2 text-gray-400 hover:text-white transition"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <Send className={`w-4 h-4 ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* ——— NAVIGATION ——— */}
      <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 rounded-xl mx-3 mb-1 transition-all ${
                isActive
                  ? "bg-[var(--nexus-accent)]/20 text-[var(--nexus-accent)] font-medium"
                  : "text-gray-400 hover:bg-[var(--nexus-card)] hover:text-gray-100"
              }`
            }
          >
            {item.icon}
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ——— FOOTER ——— */}
      <div className="p-4 border-t border-border/40">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border border-border/50 hover:border-[var(--nexus-accent)] hover:bg-[var(--nexus-accent)]/10 transition-all"
        >
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-500" />
            )}
            {!isCollapsed && (
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            )}
          </div>
          <div
            className={`relative flex h-5 w-10 rounded-full transition-colors duration-300 ${
              theme === "dark" ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-[2px] left-[2px] h-4 w-4 bg-white rounded-full transition-transform duration-300 ${
                theme === "dark" ? "translate-x-5" : "translate-x-0"
              }`}
            ></span>
          </div>
        </button>

        {/* Feedback Button */}
        {!isCollapsed && (
          <button className="mt-4 w-full flex items-center justify-center gap-2 bg-[var(--nexus-accent)] hover:bg-[var(--nexus-accent)]/90 text-white py-2 rounded-lg shadow-glow transition-all">
            <Sparkles className="w-4 h-4" />
            <span>Send Feedback</span>
          </button>
        )}
      </div>
    </aside>
  );
}
