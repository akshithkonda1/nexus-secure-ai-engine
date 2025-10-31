import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { router } from "@/app/routes";
import { ThemeProvider } from "@/shared/ui/theme/ThemeProvider";
import { queryClient } from "@/services/api/client";
import { ToastSystem } from "@/components/ui/use-toast";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { initSentry } from "@/shared/lib/sentry";

import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

initSentry();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastSystem>
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center bg-app text-primary">
                  <span className="round-card border border-subtle px-4 py-2">Loading workspace…</span>
                </div>
              }
            >
              <RouterProvider router={router} />
            </Suspense>
          </ErrorBoundary>
        </ToastSystem>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
