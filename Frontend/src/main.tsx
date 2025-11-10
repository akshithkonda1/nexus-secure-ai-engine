import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import "@/styles/globals.css";
import "@/styles/theme.css";
import { App } from "@/App";
import { Home } from "@/pages/Home";
import { Chat } from "@/pages/Chat";
import Templates from "@/pages/Templates";
import Documents from "@/pages/Documents";
import Activity from "@/pages/Activity";
import Settings from "@/pages/Settings";
import { Outbox } from "@/pages/Outbox";
import { Governance } from "@/pages/Governance";
import { ThemeProvider } from "@/shared/ui/theme/ThemeToggle";
import { ProfileProvider } from "@/features/profile/ProfileProvider";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <AppErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Navigate to="/" replace /> },
      { path: "chat", element: <Chat /> },
      { path: "outbox", element: <Outbox /> },
      { path: "templates", element: <Templates /> },
      { path: "documents", element: <Documents /> },
      { path: "activity", element: <Activity /> },
      { path: "governance", element: <Governance /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ProfileProvider>
        <RouterProvider router={router} />
      </ProfileProvider>
    </ThemeProvider>
  </React.StrictMode>
);
