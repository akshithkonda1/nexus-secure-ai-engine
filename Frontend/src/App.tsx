import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = window.localStorage.getItem("nexus.sidebar-expanded");
    if (stored === "true" || stored === "false") return stored === "true";
    return window.matchMedia("(min-width: 1280px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("nexus.sidebar-expanded", sidebarExpanded ? "true" : "false");
  }, [sidebarExpanded]);

  const activePath = useMemo(() => {
    if (!location.pathname) return "/";
    const trimmed = location.pathname.endsWith("/") && location.pathname.length > 1
      ? location.pathname.slice(0, -1)
      : location.pathname;
    return trimmed === "/home" ? "/" : trimmed;
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      <Sidebar
        active={activePath}
        expanded={sidebarExpanded}
        onNavigate={(path) => navigate(path)}
        onToggle={() => setSidebarExpanded((value) => !value)}
      />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Topbar
          activePath={activePath}
          sidebarExpanded={sidebarExpanded}
          onToggleSidebar={() => setSidebarExpanded((value) => !value)}
        />
        <main className="relative flex-1 overflow-y-auto px-4 pb-16 pt-6 sm:px-10">
          <div className="w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
