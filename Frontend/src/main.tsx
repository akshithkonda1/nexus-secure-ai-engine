// Frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import { ThemeProvider } from "@/shared/ui/theme/ThemeProvider";
import { registerServiceWorker } from "@/serviceWorker";
import "@/index.css";

// --- Boot theme early to avoid FOUC ---
(function bootstrapTheme() {
  try {
    const KEY = "nexus.theme"; // keep in sync with your theme store
    const stored = localStorage.getItem(KEY) as "light" | "dark" | null;
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const theme = stored ?? (prefersDark ? "dark" : "light");
    document.documentElement.dataset.theme = theme; // sets [data-theme="light|dark"]
  } catch {
    // no-op (SSR/sandbox)
  }
})();

// --- Mount React ---
const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// --- Register SW only in prod (optional) ---
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  try {
    registerServiceWorker();
  } catch {
    // ignore SW errors in production fallback
  }
}
