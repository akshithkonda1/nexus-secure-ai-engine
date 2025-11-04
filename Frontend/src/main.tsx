import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/routes";
import "@/shared/ui/tokens.css";

// Apply saved theme before first paint to avoid flash
(function bootstrapTheme() {
  const saved = (localStorage.getItem("nexus:theme") as "light" | "dark" | null) ?? "dark";
  document.documentElement.dataset.theme = saved;
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// Register SW only if supported (optional)
if ("serviceWorker" in navigator) {
  import("@/serviceWorker").then(({ registerServiceWorker }) => registerServiceWorker());
}
