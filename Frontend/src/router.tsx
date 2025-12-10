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
import ControlDashboard from "@/pages/control-panel/Dashboard";
import RunTests from "@/pages/control-panel/RunTests";
import TestHistory from "@/pages/control-panel/TestHistory";
import Snapshots from "@/pages/control-panel/Snapshots";
import LoadTests from "@/pages/control-panel/LoadTests";
import Stability from "@/pages/control-panel/Stability";
import WarRoom from "@/pages/control-panel/WarRoom";
import ReplayEngine from "@/pages/control-panel/ReplayEngine";

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
      { path: "/control/dashboard", element: <ControlDashboard /> },
      { path: "/control/run", element: <RunTests /> },
      { path: "/control/test-history", element: <TestHistory /> },
      { path: "/control/snapshots", element: <Snapshots /> },
      { path: "/control/load", element: <LoadTests /> },
      { path: "/control/stability", element: <Stability /> },
      { path: "/control/war-room", element: <WarRoom /> },
      { path: "/control/replay", element: <ReplayEngine /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
