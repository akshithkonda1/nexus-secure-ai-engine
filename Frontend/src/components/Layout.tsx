import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { UserBar } from "@/components/UserBar";


function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:inline-flex focus-visible:items-center focus-visible:gap-2 focus-visible:rounded-full focus-visible:bg-trustBlue focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-white focus-visible:shadow-lg"
    >
      Skip to content
    </a>
  );
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
  }, [sidebarOpen]);

  return (
    <div className="relative flex min-h-screen bg-app text-ink">
      <SkipLink />
      <div className="hidden lg:flex">
        <Sidebar variant="desktop" onNavigate={() => setSidebarOpen(false)} />
      </div>
      <AnimatePresence>
        {sidebarOpen ? (
          <>
            <motion.div
              key="sidebar-overlay"
              className="fixed inset-0 z-40 bg-app-text/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              role="presentation"
              aria-hidden="true"
            />
            <motion.div
              key="sidebar"
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <Sidebar variant="mobile" onNavigate={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
      <div className="flex min-h-screen flex-1 flex-col">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-app px-4 py-8 lg:px-10"
        >
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-app/40 border-t-trustBlue" />
                <span className="sr-only">Loading content</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
        <UserBar />
      </div>
    </div>
  );
}
