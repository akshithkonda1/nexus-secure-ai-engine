import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ChatView from "./features/convos/ChatView";
import { ThemeStyles } from "./components/ThemeStyles";
import SystemSettingsPage from "./pages/SystemSettingsPage";

function HomeRoute() {
  const navigate = useNavigate();
  return (
    <>
      <ThemeStyles />
      <ChatView onOpenSettings={() => navigate("/system-settings")} />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/system-settings" element={<SystemSettingsPage />} />
      <Route path="/" element={<HomeRoute />} />
      <Route path="*" element={<HomeRoute />} />
    </Routes>
  );
}
