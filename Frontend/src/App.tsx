import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import "@/styles/globals.css";

export function App() {
  return (
    <div className="flex h-screen bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
