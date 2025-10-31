import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AppShell from "./AppShell";
import WelcomeHub from "@/features/hub/WelcomeHub";
import PricingPage from "@/features/pricing/PricingPage";
import AuthPage from "@/features/auth/AuthPage";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <WelcomeHub /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/auth", element: <AuthPage /> },
      { path: "*", element: <div className="p-6">Not found</div> },
    ],
  },
]);
