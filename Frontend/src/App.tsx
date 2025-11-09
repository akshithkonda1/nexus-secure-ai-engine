import { Routes, Route, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { ErrorBoundary } from "./components/ErrorBoundary";

import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Sessions from "./pages/Sessions";
import Templates from "./pages/Templates";
import Documents from "./pages/Documents";
import Metrics from "./pages/Metrics";
import History from "./pages/History";
import Settings from "./pages/Settings";

function Shell() {
  const location = useLocation();
  const active = useMemo(() => location.pathname || "/home", [location.pathname]);

  return (
    <div className="min-h-screen grid grid-cols-[76px_1fr] bg-background text-foreground">
      <Sidebar active={active} />
      <div className="min-h-screen bg-background">
        <header
          className="sticky top-0 z-10 h-12 grid items-center px-4 border-b border-border/60 bg-panel/95 backdrop-blur"
        >
          <div className="text-sm text-subtle">Nexus</div>
        </header>

        <div className="p-3 sm:p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Shell />
    </ErrorBoundary>
  );
}
