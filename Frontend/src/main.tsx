import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import "@/styles/globals.css";
import "@/styles/theme.css";
import { App } from "@/App";
import { Home } from "@/pages/Home";
import { Chat } from "@/pages/Chat";
import { Templates } from "@/pages/Templates";
import { Documents } from "@/pages/Documents";
import { History } from "@/pages/History";
import { Settings } from "@/pages/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", element: <Home /> },
      { path: "chat", element: <Chat /> },
      { path: "templates", element: <Templates /> },
      { path: "documents", element: <Documents /> },
      { path: "history", element: <History /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
