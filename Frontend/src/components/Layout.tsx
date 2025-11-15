import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { UserBar } from "@/components/UserBar";
import { SidebarProvider, useSidebar } from "@/components/layout/sidebar/SidebarContext";
import { cn } from "@/shared/lib/cn";

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:inline-flex focus-visible:items-center focus-visible:gap-2 focus-visible:rounded-full focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-[rgb(var(--on-accent))] focus-visible:shadow-lg"
    >
      Skip to content
    </a>
  );
}

function LayoutContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { collapsed } = useSidebar();

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <SkipLink />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col pl-0 transition-[padding-left] duration-200",
          collapsed ? "lg:pl-[88px]" : "lg:pl-80",
        )}
      >
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 pb-10 pt-24 sm:px-6 lg:px-10 [direction:ltr]"
        >
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted/40 border-t-primary" />
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

export function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
