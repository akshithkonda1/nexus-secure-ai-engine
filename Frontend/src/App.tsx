import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatPage from "@/pages/Chat";
import Home from "@/pages/Home";
import SettingsPage from "@/pages/Settings";

const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex">
        <Sidebar active={activePath} onNavigate={navigate} />
        <main className="flex-1 lg:pl-24">
          <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {[
            "/sessions",
            "/templates",
            "/docs",
            "/metrics",
            "/history",
          ].map((path) => (
            <Route key={path} path={path} element={<Home />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
