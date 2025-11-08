import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { ThemeProvider } from "@/theme/useTheme";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Home } from "@/pages/Home";
import { Chat } from "@/pages/Chat";
import { Settings } from "@/pages/Settings";
import { Sessions } from "@/pages/Sessions";
import { SessionConsole } from "@/pages/SessionConsole";
import { Templates } from "@/pages/Templates";
import { Documents } from "@/pages/Documents";
import { Metrics } from "@/pages/Metrics";
import { History } from "@/pages/History";

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = useMemo(() => (location.pathname === "/" ? "/home" : location.pathname), [location.pathname]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[rgb(var(--text))]">
      <div className="min-h-screen grid grid-cols-[200px_1fr]">
        <Sidebar active={active} onNavigate={(path) => navigate(path)} />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="w-full max-w-7xl flex-1 px-8 pb-16 pt-8 mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/sessions/:id" element={<SessionConsole />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/history" element={<History />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </ThemeProvider>
  );
}
