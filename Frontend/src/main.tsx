import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/styles/tokens.css";
import "@/styles/glass.css";
import "@/styles/globals.css";
import "@/styles/zora-theme.css";
import RootLayout from "@/layouts/RootLayout";
import { ThemeProvider } from "@/shared/ui/theme/ThemeProvider";
import { ProfileProvider } from "@/features/profile/ProfileProvider";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { ErrorBoundary } from "@/routes/ErrorBoundary";
import { PanelProvider } from "@/panels/PanelProvider";

const Home = lazy(() => import("@/pages/Home"));
const Chat = lazy(() => import("@/pages/Chat"));
const Outbox = lazy(() => import("@/pages/Outbox"));
const Governance = lazy(() => import("@/pages/Governance"));
const Guides = lazy(() => import("@/pages/Guides"));
const ProjectsPage = lazy(() => import("@/features/projects/ProjectsPage"));
const ProjectsAllPage = lazy(() => import("@/features/projects/ProjectsAllPage"));

const Templates = lazy(() => import("@/pages/Templates"));
const Documents = lazy(() => import("@/pages/Documents"));
const Activity = lazy(() => import("@/pages/History"));
const Settings = lazy(() => import("@/pages/Settings"));

const Fallback = () => (
  <section className="panel panel--glassy panel--hover p-6 space-y-4">
    <div className="skeleton skeleton-line w-48" />
    <div className="skeleton skeleton-line w-80" />
    <div className="skeleton skeleton-line w-64" />
  </section>
);

const withSuspense = (
  Component: React.LazyExoticComponent<React.ComponentType>,
): React.ReactElement => (
  <ErrorBoundary>
    <Suspense fallback={<Fallback />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <RootLayout />
      </ErrorBoundary>
    ),
    errorElement: <AppErrorBoundary />,
    children: [
      {
        index: true,
        element: withSuspense(Home),
      },
      { path: "home", element: <Navigate to="/" replace /> },
      {
        path: "chat",
        element: withSuspense(Chat),
      },
      {
        path: "outbox",
        element: withSuspense(Outbox),
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
        element: withSuspense(ProjectsPage),
      },
      {
        path: "projects/all",
        element: withSuspense(ProjectsAllPage),
      },
      {
        path: "governance",
        element: withSuspense(Governance),
      },
      {
        path: "guides",
        element: withSuspense(Guides),
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
          <PanelProvider>
            <RouterProvider router={router} />
          </PanelProvider>
        </ProfileProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
