import { Suspense } from "react";
import { Outlet, useRoutes } from "react-router-dom";
import { AppShell } from "./AppShell";
import { ChatWorkspace } from "../features/chat/ChatWorkspace";
import { PricingPage } from "../features/pricing/PricingPage";
import { SettingsLayout } from "../features/settings/SettingsLayout";
import { AppearanceSettings } from "../features/settings/AppearanceSettings";
import { BillingSettings } from "../features/settings/BillingSettings";

function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
      <div className="rounded-full bg-accent-soft px-4 py-2 text-xs uppercase tracking-wide text-muted">404</div>
      <h1 className="text-2xl font-semibold">We searched every channel.</h1>
      <p className="max-w-md text-sm text-muted">
        The page you are looking for has been archived into the Nexus vault. Double-check the URL or jump back to your chats.
      </p>
    </div>
  );
}

function SettingsOutlet() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading settings…</div>}>
      <Outlet />
    </Suspense>
  );
}

export function AppRoutes() {
  const element = useRoutes([
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
        { path: "settings/*", element: <SettingsOutlet /> },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ]);
  return element;
}
