import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import { ThemeProvider } from "@/shared/ui/theme/ThemeProvider";
import { Toaster } from "@/shared/ui/components/toast";
import { registerServiceWorker } from "@/serviceWorker";
import "@/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  try {
    registerServiceWorker();
  } catch {
    // ignore SW errors in production fallback
  }
}
