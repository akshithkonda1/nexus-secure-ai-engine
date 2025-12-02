import React from "react";
import { Outlet } from "react-router-dom";
import TopNav from "../components/navigation/TopNav";
import SideNav from "../components/navigation/SideNav";
import ToronBubble from "../components/toron/ToronBubble";

const MainLayout: React.FC = () => {
  return (
    <div className="layout-shell">
      <TopNav />
      <div className="layout-body">
        <SideNav />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
      <ToronBubble notification="New insight" />
    </div>
  );
};

export default MainLayout;
