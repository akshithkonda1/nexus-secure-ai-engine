import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/app/AppShell";
import { ChatWorkspace } from "@/features/chat/ChatWorkspace";
import { PricingPage } from "@/features/pricing/PricingPage";
import { SettingsLayout } from "@/features/settings/SettingsLayout";
import { AppearanceSettings } from "@/features/settings/AppearanceSettings";
import { BillingSettings } from "@/features/settings/BillingSettings";
import { NotFound } from "@/app/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <ChatWorkspace /> },
      { path: "pricing", element: <PricingPage /> },
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
