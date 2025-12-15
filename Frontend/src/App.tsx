import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import AuthPage from "./pages/Auth";
import HomePage from "./pages/Home";
import SettingsPage from "./pages/Settings";
import ToronPage from "./pages/Toron";
import WorkspacePage from "./pages/Workspace";

const Shell = () => (
  <AppLayout>
    <Outlet />
  </AppLayout>
);

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<Shell />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/toron" element={<ToronPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
