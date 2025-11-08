import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { AuthGate } from "@/app/AuthGate";
import AuthPage from "@/pages/AuthPage";
import AuthCallback from "@/pages/AuthCallback";
import Login from "@/features/auth/Login";
import WelcomeHub from "@/features/hub/WelcomeHub";
import ChatWorkspace from "@/features/chat/ChatWorkspace";
import ProjectsPage from "@/features/projects/ProjectsPage";
import LibraryPage from "@/features/library/LibraryPage";
import PricingPage from "@/features/pricing/PricingPage";
import { SystemPage } from "@/features/system/SystemPage";
import SettingsPage from "@/features/settings/SettingsPage";
export const router = createBrowserRouter([
  { path: "/auth", element: <AuthPage /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <AuthGate><AppShell /></AuthGate>,
    children: [
      { index: true, element: <WelcomeHub /> },
      { path: "chat/:id", element: <ChatWorkspace /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "library", element: <LibraryPage /> },
      { path: "pricing", element: <PricingPage /> },
      { path: "system", element: <SystemPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
