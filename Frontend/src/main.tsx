import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import ProfileModal from "@/features/profile/ProfileModal";
import { ThemeProvider } from "@/shared/ui/theme/ThemeProvider";
import { AppShell } from "@/app/AppShell";
import { queryClient } from "@/services/api/client";
import "@/shared/ui/tokens.css";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Nexus requires a #root element in index.html");
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppShell>
            <App />
            <ProfileModal />
          </AppShell>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
