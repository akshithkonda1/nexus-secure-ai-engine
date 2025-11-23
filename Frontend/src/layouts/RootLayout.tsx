import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RyuzenCommandCenterOverlay } from "@/components/command-center/RyuzenCommandCenterOverlay";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function RootLayout() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--surface-base)] text-[var(--text-primary)]">
      <div className="backdrop-gradient" aria-hidden="true" />
      <div className="noise-overlay" aria-hidden="true" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 rounded-lg bg-black/60 px-3 py-2 text-white"
      >
        Skip to main content
      </a>

      <Header onOpenProfile={() => setIsProfileOpen(true)} />

      <div className="main-shell">
        <Sidebar />
        <main id="main-content" className="content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.2, ease: "easeIn" } }}
              className="gpu"
            >
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ProfileModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <RyuzenCommandCenterOverlay />
    </div>
  );
}
