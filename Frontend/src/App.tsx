import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "@/components/Header";
import { RightRail } from "@/components/RightRail";
import { Sidebar } from "@/components/Sidebar";
import "@/styles/globals.css";

export function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-transparent text-[rgb(var(--text))]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col bg-transparent/0">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto px-5 pb-10 pt-6 md:px-8 lg:px-12">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
              <Outlet />
            </div>
          </main>
          <RightRail />
        </div>
      </div>
    </div>
  );
}
