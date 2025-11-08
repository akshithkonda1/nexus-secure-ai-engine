import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = useMemo(() => {
    if (!location.pathname) return "/chat";
    return location.pathname.endsWith("/") && location.pathname.length > 1
      ? location.pathname.slice(0, -1)
      : location.pathname;
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      <Sidebar active={activePath} onNavigate={(path) => navigate(path)} />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Topbar activePath={activePath} />
        <main className="relative flex-1 overflow-y-auto px-4 pb-16 pt-6 sm:px-10">
          <div className="w-full max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
