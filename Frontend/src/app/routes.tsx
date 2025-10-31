import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/app/AppShell";
import { ChatWorkspace } from "@/features/chat/ChatWorkspace";
import { NotFound } from "@/app/NotFound";

const PricingPage = lazy(() => import("@/features/pricing/PricingPage").then((module) => ({ default: module.PricingPage })));
const SettingsLayout = lazy(() =>
  import("@/features/settings/SettingsLayout").then((module) => ({ default: module.SettingsLayout }))
);
const AppearanceSettings = lazy(() =>
  import("@/features/settings/AppearanceSettings").then((module) => ({ default: module.AppearanceSettings }))
);
const BillingSettings = lazy(() =>
  import("@/features/settings/BillingSettings").then((module) => ({ default: module.BillingSettings }))
);
const SystemPage = lazy(() => import("@/features/system/SystemPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <ChatWorkspace /> },
      { path: "pricing", element: <PricingPage /> },
      { path: "system", element: <SystemPage /> },
      {
        path: "settings",
        element: <SettingsLayout />,
        children: [
          { index: true, element: <AppearanceSettings /> },
          { path: "appearance", element: <AppearanceSettings /> },
          { path: "billing", element: <BillingSettings /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
