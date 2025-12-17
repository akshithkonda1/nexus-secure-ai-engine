import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, Layout, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, bg, text, border, patterns } from "../utils/theme";
import { useState } from "react";
import RyuzenLogo from "../assets/ryuzen-logo.png";

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Toron", to: "/toron", icon: MessageSquare },
  { label: "Workspace", to: "/workspace", icon: Layout },
];

type SidebarProps = {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
};

export default function Sidebar({ collapsed: controlledCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  // Use controlled if provided, otherwise use internal state
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  
  const handleToggle = () => {
    const newCollapsed = !collapsed;
    if (onToggle) {
      onToggle(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col justify-between py-6 transition-all duration-300",
        bg.surface,
        text.primary,
        collapsed ? "w-20 items-center px-3" : "w-64 px-5"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={handleToggle}
        className={cn(
          "absolute -right-3 top-8 z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all",
          border.subtle,
          bg.surface,
          "hover:bg-gray-100 dark:hover:bg-slate-700",
          "shadow-sm"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className={cn("h-3.5 w-3.5", text.muted)} />
        ) : (
          <ChevronLeft className={cn("h-3.5 w-3.5", text.muted)} />
        )}
      </button>

      <div className={cn("space-y-8", collapsed && "space-y-6")}>
        {/* Logo and Brand */}
        <div 
          className={cn(
            "flex items-center gap-3 transition-all duration-300",
            collapsed ? "justify-center px-0" : "px-2"
          )}
        >
          <div className={cn(
            "group relative flex items-center justify-center rounded-xl shadow-lg transition-all duration-300",
            "bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600",
            "hover:shadow-xl hover:scale-105",
            "ring-2 ring-blue-500/20 dark:ring-purple-500/20",
            collapsed ? "h-11 w-11 p-2.5" : "h-11 w-11 p-2.5"
          )}>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <img 
              src={RyuzenLogo} 
              alt="Ryuzen" 
              className="relative z-10 h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          
          <span 
            className={cn(
              "text-xl font-bold tracking-tight transition-all duration-300",
              "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400",
              collapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100"
            )}
          >
            Ryuzen
          </span>
        </div>

        {/* Navigation */}
        <nav className={cn("flex flex-col gap-1", collapsed && "items-center")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                className="w-full"
              >
                <div className={cn(
                  patterns.navItem(active),
                  collapsed && "justify-center px-3"
                )}>
                  {/* Active indicator */}
                  <span
                    className={cn(
                      "absolute left-0 h-full w-1 rounded-r-full transition-all duration-200",
                      active ? "bg-gradient-to-b from-blue-600 to-purple-600 opacity-100" : "opacity-0"
                    )}
                    aria-hidden
                  />
                  
                  {/* Icon */}
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-all duration-200",
                      collapsed ? "" : "ml-3",
                      active 
                        ? cn(text.primary, "scale-110") 
                        : cn(text.muted, "group-hover:text-[var(--text)] group-hover:scale-105")
                    )}
                    aria-hidden
                  />
                  
                  {/* Label */}
                  <span 
                    className={cn(
                      "tracking-normal transition-all duration-300 whitespace-nowrap",
                      collapsed 
                        ? "w-0 overflow-hidden opacity-0" 
                        : "w-auto opacity-100"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Settings at Bottom */}
      <nav className={cn(
        "border-t pt-6 transition-all duration-300",
        border.subtle,
        collapsed && "w-full"
      )}>
        <NavLink 
          to="/settings"
          title={collapsed ? "Settings" : undefined}
          aria-label="Settings"
          className="w-full"
        >
          <div className={cn(
            patterns.navItem(location.pathname === "/settings"),
            collapsed && "justify-center px-3"
          )}>
            {/* Active indicator */}
            <span
              className={cn(
                "absolute left-0 h-full w-1 rounded-r-full transition-all duration-200",
                location.pathname === "/settings" 
                  ? "bg-gradient-to-b from-blue-600 to-purple-600 opacity-100" 
                  : "opacity-0"
              )}
              aria-hidden
            />
            
            {/* Icon */}
            <Settings
              className={cn(
                "h-5 w-5 flex-shrink-0 transition-all duration-200",
                collapsed ? "" : "ml-3",
                location.pathname === "/settings"
                  ? cn(text.primary, "scale-110")
                  : cn(text.muted, "group-hover:text-[var(--text)] group-hover:scale-105")
              )}
              aria-hidden
            />
            
            {/* Label */}
            <span 
              className={cn(
                "tracking-normal transition-all duration-300 whitespace-nowrap",
                collapsed 
                  ? "w-0 overflow-hidden opacity-0" 
                  : "w-auto opacity-100"
              )}
            >
              Settings
            </span>
          </div>
        </NavLink>
      </nav>
    </div>
  );
}
