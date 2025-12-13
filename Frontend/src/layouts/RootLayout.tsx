import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";

import { CosmicCanvas } from "@/components/layout/CosmicCanvas";
import { FadeIn } from "@/components/animations/FadeIn";
import { RyuzenErrorBoundary } from "@/components/errors/RyuzenErrorBoundary";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

export default function RootLayout() {
  console.log("RootLayout Loaded");
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] transition-all">
      <CosmicCanvas />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        mobileVisible={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            className="fixed inset-0 z-20 bg-bgElevated/60 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`relative z-10 flex min-h-screen flex-col transition-[margin-left] duration-300 ${
          collapsed ? "lg:ml-[86px]" : "lg:ml-[var(--sidebar-width)]"
        }`}
      >
        <Header onToggleSidebar={() => setMobileNavOpen((prev) => !prev)} />

        <main id="main-content" className="main-canvas relative flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" } }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.18, ease: "easeIn" } }}
              className="gpu"
            >
              <RyuzenErrorBoundary>
                <FadeIn>
                  <Outlet key={location.key} />
                </FadeIn>
              </RyuzenErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <FeedbackModal />
    </div>
  );
}
