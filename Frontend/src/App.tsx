import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell";
import HomePage from "./pages/Home";
import SettingsPage from "./pages/Settings";
import ToronPage from "./pages/Toron";
import WorkspacePage from "./pages/Workspace";
import HomeRail from "./pages/rails/HomeRail";
import ToronRail from "./pages/rails/ToronRail";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route
        path="/"
        element={
          <AppShell rightRail={<HomeRail />}>
            <HomePage />
          </AppShell>
        }
      />
      <Route
        path="/toron"
        element={
          <AppShell rightRail={<ToronRail />}>
            <ToronPage />
          </AppShell>
        }
      />
      <Route
        path="/workspace"
        element={
          <AppShell>
            <WorkspacePage />
          </AppShell>
        }
      />
      <Route
        path="/settings"
        element={
          <AppShell>
            <SettingsPage />
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
