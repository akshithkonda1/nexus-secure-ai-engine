import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import CosmicCanvas from "../components/layout/CosmicCanvas";
import TopNav from "../components/navigation/TopNav";
import SideNav from "../components/navigation/SideNav";
import ProfileModal from "../components/layout/ProfileModal";
import AppRouter from "../router";

const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <CosmicCanvas />
      <div className="app-surface">
        <SideNav collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((prev) => !prev)} />
        <div className="content-surface">
          <TopNav onProfile={() => setProfileOpen(true)} />
          <main className="page-shell">
            <AppRouter />
          </main>
        </div>
      </div>
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} key={location.pathname} />}
    </div>
  );
};

export default AppShell;
