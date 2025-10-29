import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { router } from "@/app/routes";
import { ThemeProvider } from "@/shared/ui/theme/ThemeProvider";
import { queryClient } from "@/services/api/client";
import { ToastSystem } from "@/components/ui/use-toast";

import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastSystem>
          <RouterProvider router={router} />
        </ToastSystem>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
