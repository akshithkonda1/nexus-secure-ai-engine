import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Toron from "../pages/Toron";
import Workspace from "../pages/Workspace";
import Projects from "../pages/Projects";
import Documents from "../pages/Documents";
import History from "../pages/History";
import Settings from "../pages/Settings";
import Feedback from "../pages/Feedback";

const AppRouter: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/toron" element={<Toron />} />
    <Route path="/workspace" element={<Workspace />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/documents" element={<Documents />} />
    <Route path="/history" element={<History />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/feedback" element={<Feedback />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRouter;
