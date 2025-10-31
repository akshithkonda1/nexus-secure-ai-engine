import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { WelcomeHub } from "@/features/hub/WelcomeHub";
import { ChatWorkspace } from "@/features/chat/ChatWorkspace";
import { PricingPage } from "@/features/pricing/PricingPage";
import { SystemPage } from "@/features/system/SystemPage";
import { LoginPage } from "@/features/auth/Login";
import { ProjectsPane } from "@/features/projects/ProjectsPane";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <WelcomeHub /> },
      { path: "chat", element: <ChatWorkspace /> },
      { path: "projects", element: <ProjectsPane standalone /> },
      { path: "pricing", element: <PricingPage /> },
      { path: "system", element: <SystemPage /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "*", element: <AppShell /> },
]);
