import { Fragment, Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { UserBar } from "@/components/UserBar";

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-50 focus-visible:inline-flex focus-visible:items-center focus-visible:gap-2 focus-visible:rounded-full focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-white focus-visible:shadow-lg"
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.body.style.backgroundColor = "";
    document.body.classList.add("bg-surface");
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.classList.remove("bg-surface");
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-surface text-white">
      <SkipLink />
      <Sidebar variant="desktop" onNavigate={() => setSidebarOpen(false)} />

      <Transition show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-150 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="duration-150 ease-in"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="fixed inset-y-0 left-0 flex w-72 max-w-full">
              <Sidebar variant="mobile" onNavigate={() => setSidebarOpen(false)} />
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>

      <div className="flex min-h-screen flex-1 flex-col pl-0 lg:pl-64">
        <Header onToggleSidebar={() => setSidebarOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 pb-10 pt-24 sm:px-6 lg:px-10"
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
