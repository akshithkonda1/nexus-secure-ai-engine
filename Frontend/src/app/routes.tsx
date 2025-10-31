import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import NotFound from "@/app/NotFound";
import { ChatWorkspace } from "@/features/chat/ChatWorkspace";
import { WelcomeHub } from "@/features/hub/WelcomeHub";
import ProjectsPane from "@/features/system/ProjectsPane";
import LibraryPane from "@/features/system/LibraryPane";

const PricingPage = lazy(() => import("@/features/pricing/PricingPage"));
const SettingsLayout = lazy(() => import("@/features/settings/SettingsLayout"));
const AppearanceSettings = lazy(() => import("@/features/settings/AppearanceSettings"));
const BillingSettings = lazy(() => import("@/features/settings/BillingSettings"));
const SystemPage = lazy(() => import("@/features/system/SystemPage"));

const suspense = (element: React.ReactNode) => (
  <Suspense fallback={<div className="flex flex-1 items-center justify-center text-muted">Loading…</div>}>
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    errorElement: <NotFound />, // fallback
    children: [
      {
        index: true,
        element: <WelcomeHub />
      },
      {
        path: "chat",
        element: <ChatWorkspace />
      },
      {
        path: "projects",
        element: <ProjectsPane />
      },
      {
        path: "library",
        element: <LibraryPane />
      },
      {
        path: "system",
        element: suspense(<SystemPage />)
      },
      {
        path: "pricing",
        element: suspense(<PricingPage />)
      },
      {
        path: "settings",
        element: suspense(<SettingsLayout />),
        children: [
          {
            index: true,
            element: <Navigate to="appearance" replace />
          },
          {
            path: "appearance",
            element: suspense(<AppearanceSettings />)
          },
          {
            path: "billing",
            element: suspense(<BillingSettings />)
          }
        ]
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
