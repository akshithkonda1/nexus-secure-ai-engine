import { Route, Routes } from "react-router-dom";

import RootLayout from "@/layouts/RootLayout";
import { ProjectProvider } from "@/features/projects/ProjectProvider";
import Documents from "@/pages/Documents";
import FeedbackDashboard from "@/pages/FeedbackDashboard";
import History from "@/pages/History";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import ProjectDashboard from "@/pages/projects/ProjectDashboard";
import ProjectView from "@/pages/projects/ProjectView";
import Settings from "@/pages/Settings";
import SimDashboard from "@/pages/SimDashboard";
import ToronPage from "@/pages/Toron/ToronPage";
import Workspace from "@/pages/Workspace";

export function App() {
  console.log("Ryuzen App Mounted");
  return (
    <Routes>
      <Route element={<ProjectProvider><RootLayout /></ProjectProvider>}>
        <Route path="/" element={<Home />} />
        <Route path="/toron" element={<ToronPage />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/projects" element={<ProjectDashboard />} />
        <Route path="/projects/:id" element={<ProjectView />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/feedback-dashboard" element={<FeedbackDashboard />} />
        <Route path="/sim-dashboard" element={<SimDashboard />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
