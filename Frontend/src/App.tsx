import React from "react";
import { Routes, Route, useNavigate, Outlet } from "react-router-dom";
import ChatView from "./features/convos/ChatView";
import SystemSettingsPage from "./pages/SystemSettingsPage";
import PricingPage from "@/features/pricing/PricingPage";
import NotFoundPage from "./pages/NotFoundPage";

function HomeRoute() {
  const navigate = useNavigate();
  return (
    <>
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
      <Route path="pricing" element={<PricingPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
