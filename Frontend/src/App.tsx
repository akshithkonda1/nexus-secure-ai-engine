import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { useMemo } from "react";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = useMemo(() => location.pathname || "/", [location.pathname]);

  return (
    <div className="h-full w-full grid grid-cols-[72px_1fr]">
      <Sidebar active={active} onNavigate={(p) => navigate(p)} />
      <div className="relative flex flex-col">
        <Topbar onOpenConsole={() => navigate("/chat")} />
        <main className="flex-1 overflow-auto px-6 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
