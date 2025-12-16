import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageSquare, Layout, Settings } from "lucide-react";

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Toron", to: "/toron", icon: MessageSquare },
  { label: "Workspace", to: "/workspace", icon: Layout },
];

// Dragon logo SVG component with gradient
function DragonLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10">
      <path
        d="M20 4C18 4 16 5 15 7L12 12C11 14 10 16 11 18C11.5 19 12.5 19.5 14 19.5C14 20 14 21 15 22C16 23 17.5 23.5 19 23.5C19 25 19.5 27 21 28.5C22.5 30 25 31 27 30.5C28.5 30 29.5 28.5 30 27C30.5 25.5 30.5 24 30 22.5C31 22 32 21 32.5 19.5C33 18 33 16 31.5 14.5C30 13 28 12.5 26 13C26 11.5 25.5 10 24 9C22.5 8 21 7.5 20 4Z"
        fill="currentColor"
      />
      {/* Dragon eye */}
      <circle cx="23" cy="15" r="1.5" fill="var(--bg-app)" />
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
    <div className="flex h-full w-full flex-col justify-between bg-white px-5 py-6 dark:bg-slate-900">
      <div className="space-y-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <DragonLogo />
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-slate-100">Ryuzen</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to}>
                <div
                  className={`group relative flex items-center gap-3 rounded-lg py-2.5 pr-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-slate-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  }`}
                >
                  <span
                    className={`absolute left-0 h-full w-1 rounded-r-full transition-colors ${active ? "bg-blue-600" : "bg-transparent"}`}
                    aria-hidden
                  />
                  <Icon className={`ml-3 h-5 w-5 ${active ? "text-gray-900 dark:text-slate-100" : "text-gray-500 group-hover:text-gray-900 dark:text-slate-400 dark:group-hover:text-slate-100"}`} aria-hidden />
                  <span className="tracking-normal">{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <nav className="border-t border-gray-200 pt-6 dark:border-slate-700">
        <NavLink to="/settings">
          <div
            className={`group relative flex items-center gap-3 rounded-lg py-2.5 pr-3 text-sm font-medium transition-colors ${
              location.pathname === "/settings"
                ? "bg-gray-100 text-gray-900 dark:bg-slate-800 dark:text-slate-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            <span
              className={`absolute left-0 h-full w-1 rounded-r-full transition-colors ${
                location.pathname === "/settings" ? "bg-blue-600" : "bg-transparent"
              }`}
              aria-hidden
            />
            <Settings className={`ml-3 h-5 w-5 ${location.pathname === "/settings" ? "text-gray-900 dark:text-slate-100" : "text-gray-500 group-hover:text-gray-900 dark:text-slate-400 dark:group-hover:text-slate-100"}`} aria-hidden />
            <span>Settings</span>
          </div>
        </NavLink>
      </nav>
    </div>
  );
}
