import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/auth/Login";
import SignupPage from "./pages/auth/Signup";
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
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/toron" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/toron" replace /> : <SignupPage />}
      />

      {/* Legacy auth route redirect */}
      <Route path="/auth" element={<Navigate to="/login" replace />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell rightRail={<HomeRail />}>
              <HomePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <AppShell rightRail={<HomeRail />}>
              <ProjectsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <AppShell rightRail={<HomeRail />}>
              <TemplatesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <AppShell rightRail={<HomeRail />}>
              <DocumentsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <AppShell rightRail={<HomeRail />}>
              <CommunityPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppShell rightRail={<HomeRail />}>
              <HistoryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/toron"
        element={
          <ProtectedRoute>
            <AppShell rightRail={<ToronRail />}>
              <ToronPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workspace"
        element={
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppShell>
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <AppShell>
              <HelpPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
