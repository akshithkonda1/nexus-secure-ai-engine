import { useState } from "react";
import { Outlet } from "react-router-dom";

import AppShell from "@/components/AppShell";
import { Header } from "@/components/Header";
import { RightRail } from "@/components/RightRail";
import { Sidebar } from "@/components/Sidebar";
import { ProfileModal } from "@/components/ProfileModal";
import { NotificationsModal } from "@/components/NotificationsModal";
import { useCommand } from "@/lib/actions";
import { Toaster } from "@/shared/ui/components/toast";
import AmbientFX from "@/components/AmbientFX";
import { SidebarProvider } from "@/components/layout/sidebar/SidebarContext";
import { CommandCenter } from "@/components/shell/CommandCenter";

export default function RootLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isCommandCenterOpen, setCommandCenterOpen] = useState(false);

  useCommand((command) => {
    if (command.type === "profile:open") {
      setProfileOpen(true);
      return;
    }

    if (command.type === "notifications:open") {
      setNotificationsOpen(true);
    }
  });

  return (
    <SidebarProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 btn-ghost z-50"
      >
        Skip to content
      </a>
      <AppShell
        left={<Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />}
        right={<RightRail />}
      >
        <div className="flex min-h-full flex-col bg-transparent text-zora-white">
          <Header
            onOpenCommandCenter={() => setCommandCenterOpen(true)}
            onOpenProfile={() => setProfileOpen(true)}
          />
          <div className="flex-1">
            <div
              id="main"
              role="main"
              className="ambient-page h-full px-5 pb-10 pt-6 md:px-8 lg:px-12"
            >
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </AppShell>
      <CommandCenter
        open={isCommandCenterOpen}
        onClose={() => setCommandCenterOpen(false)}
      />
      <ProfileModal open={isProfileOpen} onOpenChange={setProfileOpen} />
      <NotificationsModal
        open={isNotificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <Toaster />
      <AmbientFX />
    </SidebarProvider>
  );
}
