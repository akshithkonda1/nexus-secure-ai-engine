import React from "react";
import { Routes, Route, useNavigate, Outlet, Navigate } from "react-router-dom";
import ChatView from "./features/convos/ChatView";
import { ThemeStyles } from "./components/ThemeStyles";
import SystemSettingsPage from "./pages/SystemSettingsPage";

function HomeRoute() {
  const navigate = useNavigate();
  return (
    <>
      <ThemeStyles />
      <ChatView onOpenSettings={() => navigate("/system-settings")} />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />}>
        <Route path="system-settings" element={<SystemSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
