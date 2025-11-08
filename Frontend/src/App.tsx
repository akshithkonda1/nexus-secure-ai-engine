// Frontend/src/App.tsx
import React, { useEffect, useMemo, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";

// Keep these as named imports if your components export named
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./pages/Home";
import { Chat } from "./pages/Chat";
import { Settings } from "./pages/Settings";

// ——————————————————————————————————————————
// Layout shell (Header, Sidebar, content area)
// ——————————————————————————————————————————
function Shell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Active path for Sidebar highlighting
  const active = useMemo(
    () => (location.pathname === "/" ? "/home" : location.pathname),
    [location.pathname]
  );

  // Restore scroll to top on every route change
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    } catch {
      // older chromium: fallback
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--nexus-bg)",
        color: "var(--nexus-text)",
      }}
    >
      {/* Fixed header */}
      <div className="fixed inset-x-0 top-0 z-40">
        <Header />
      </div>

      {/* Fixed sidebar (below header) */}
      <div className="fixed left-0 top-16 bottom-0 z-30 w-64">
        <Sidebar active={active} onNavigate={(p: string) => navigate(p)} />
      </div>

      {/* Main content area with padding so it doesn’t live under header/sidebar */}
      <main className="pt-16 pl-64">
        <div className="p-6">
          <Suspense
            fallback={
              <div className="text-sm text-gray-400">Loading page…</div>
            }
          >
            <Routes>
              {/* Canonical pages */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />

              {/* Stubs so Sidebar buttons never break during buildout */}
              <Route path="/sessions" element={<Home />} />
              <Route path="/templates" element={<Home />} />
              <Route path="/docs" element={<Home />} />
              <Route path="/metrics" element={<Home />} />
              <Route path="/history" element={<Home />} />

              {/* 404 → home (prevents blank screen on bad URL) */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

// ——————————————————————————————————————————
// App root with BrowserRouter
// ——————————————————————————————————————————
export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
