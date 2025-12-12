import { createBrowserRouter } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";
import Documents from "@/pages/Documents";
import FeedbackDashboard from "@/pages/FeedbackDashboard";
import History from "@/pages/History";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import ProjectDashboard from "@/pages/projects/ProjectDashboard";
import ProjectView from "@/pages/projects/ProjectView";
import Settings from "@/pages/Settings";
import ToronPage from "@/pages/Toron/ToronPage";
import Workspace from "@/pages/Workspace";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/toron", element: <ToronPage /> },
      { path: "/workspace", element: <Workspace /> },
      { path: "/projects", element: <ProjectDashboard /> },
      { path: "/projects/:id", element: <ProjectView /> },
      { path: "/documents", element: <Documents /> },
      { path: "/history", element: <History /> },
      { path: "/settings", element: <Settings /> },
      { path: "/feedback-dashboard", element: <FeedbackDashboard /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
