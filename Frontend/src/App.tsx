import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell";
import HomePage from "./pages/Home";
import ProjectsPage from "./pages/Projects";
import TemplatesPage from "./pages/Templates";
import DocumentsPage from "./pages/Documents";
import CommunityPage from "./pages/Community";
import HistoryPage from "./pages/History";
import SettingsPage from "./pages/Settings";
import HelpPage from "./pages/Help";
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
        path="/projects"
        element={
          <AppShell rightRail={<HomeRail />}>
            <ProjectsPage />
          </AppShell>
        }
      />
      <Route
        path="/templates"
        element={
          <AppShell rightRail={<HomeRail />}>
            <TemplatesPage />
          </AppShell>
        }
      />
      <Route
        path="/documents"
        element={
          <AppShell rightRail={<HomeRail />}>
            <DocumentsPage />
          </AppShell>
        }
      />
      <Route
        path="/community"
        element={
          <AppShell rightRail={<HomeRail />}>
            <CommunityPage />
          </AppShell>
        }
      />
      <Route
        path="/history"
        element={
          <AppShell rightRail={<HomeRail />}>
            <HistoryPage />
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
      <Route
        path="/help"
        element={
          <AppShell>
            <HelpPage />
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
