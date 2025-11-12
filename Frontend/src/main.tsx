import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/styles/globals.css";
import { App } from "@/App";
import { Home } from "@/pages/Home";
import { Chat } from "@/pages/Chat";
import { Outbox } from "@/pages/Outbox";
import { Governance } from "@/pages/Governance";
import { Guides } from "@/pages/Guides";
import { ThemeProvider } from "@/shared/ui/theme/ThemeToggle";
import { ProfileProvider } from "@/features/profile/ProfileProvider";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import ProjectsPage from "@/features/projects/ProjectsPage";
import ProjectsAllPage from "@/features/projects/ProjectsAllPage";
import { ErrorBoundary } from "@/routes/ErrorBoundary";
import { initTheme } from "./theme";

const Templates = lazy(() => import("@/pages/Templates"));
const Documents = lazy(() => import("@/pages/Documents"));
const Activity = lazy(() => import("@/pages/History"));
const Settings = lazy(() => import("@/pages/Settings"));

initTheme();

const Fallback = () => (
  <section className="panel panel--glassy panel--hover p-6 space-y-4">
    <div className="skeleton skeleton-line w-48" />
    <div className="skeleton skeleton-line w-80" />
    <div className="skeleton skeleton-line w-64" />
  </section>
);

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    ),
    errorElement: <AppErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <Home />
          </ErrorBoundary>
        ),
      },
      { path: "home", element: <Navigate to="/" replace /> },
      {
        path: "chat",
        element: (
          <ErrorBoundary>
            <Chat />
          </ErrorBoundary>
        ),
      },
      {
        path: "outbox",
        element: (
          <ErrorBoundary>
            <Outbox />
          </ErrorBoundary>
        ),
      },
      {
        path: "templates",
        element: (
          <ErrorBoundary>
            <Suspense fallback={<Fallback />}>
              <Templates />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: "documents",
        element: (
          <ErrorBoundary>
            <Suspense fallback={<Fallback />}>
              <Documents />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: "history",
        element: (
          <ErrorBoundary>
            <Suspense fallback={<Fallback />}>
              <Activity />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: "projects",
        element: (
          <ErrorBoundary>
            <ProjectsPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "projects/all",
        element: (
          <ErrorBoundary>
            <ProjectsAllPage />
          </ErrorBoundary>
        ),
      },
      {
        path: "governance",
        element: (
          <ErrorBoundary>
            <Governance />
          </ErrorBoundary>
        ),
      },
      {
        path: "guides",
        element: (
          <ErrorBoundary>
            <Guides />
          </ErrorBoundary>
        ),
      },
      {
        path: "settings",
        element: (
          <ErrorBoundary>
            <Suspense fallback={<Fallback />}>
              <Settings />
            </Suspense>
          </ErrorBoundary>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ProfileProvider>
          <RouterProvider router={router} />
        </ProfileProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
