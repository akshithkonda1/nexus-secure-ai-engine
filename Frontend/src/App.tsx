import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { BillingWaitlistModal } from "@/components/modals/BillingWaitlistModal";
import { FeedbackModal } from "@/components/modals/FeedbackModal";
import { ReferModal } from "@/components/modals/ReferModal";

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
    <>
      <div className="relative flex min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#f9fafe] via-[#f1f3ff] to-[#e8ecff] text-[rgb(var(--text))] transition-colors duration-300 dark:from-[#0b0f17] dark:via-[#121825] dark:to-[#1b2233]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(140%_100%_at_0%_0%,rgba(94,151,255,0.18),transparent_60%)] opacity-70 dark:bg-[radial-gradient(120%_90%_at_0%_0%,rgba(94,151,255,0.28),transparent_68%)]" />
        <Sidebar
          active={activePath}
          expanded={sidebarExpanded}
          onNavigate={(path) => navigate(path)}
          onToggle={() => setSidebarExpanded((value) => !value)}
        />
        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          <Topbar
            activePath={activePath}
            sidebarExpanded={sidebarExpanded}
            onToggleSidebar={() => setSidebarExpanded((value) => !value)}
          />
          <main className="relative flex-1 overflow-y-auto">
            <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-[var(--page-padding)] pb-24 pt-16">
              <div className="absolute inset-6 -z-10 rounded-[calc(var(--radius-xl)*1.4)] bg-white/40 shadow-[0_60px_140px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-colors duration-300 dark:bg-white/5" />
              <div className="relative flex-1">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>

      <ProfileModal />
      <BillingWaitlistModal />
      <FeedbackModal />
      <ReferModal />
    </>
  );
}
