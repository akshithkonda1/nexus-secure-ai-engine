import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Workspace from "../pages/Workspace";
import ListsPanel from "../pages/workspace/ListsPanel";
import CalendarPanel from "../pages/workspace/CalendarPanel";
import TasksPanel from "../pages/workspace/TasksPanel";
import ConnectorsPanel from "../pages/workspace/ConnectorsPanel";
import PagesPanel from "../pages/workspace/PagesPanel";
import NotesPanel from "../pages/workspace/NotesPanel";
import BoardsPanel from "../pages/workspace/BoardsPanel";
import FlowsPanel from "../pages/workspace/FlowsPanel";
import ToronPanel from "../pages/workspace/ToronPanel";

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/workspace/lists" replace />} />
      <Route path="/workspace" element={<MainLayout />}>
        <Route index element={<Workspace />} />
        <Route path="lists" element={<ListsPanel />} />
        <Route path="calendar" element={<CalendarPanel />} />
        <Route path="tasks" element={<TasksPanel />} />
        <Route path="connectors" element={<ConnectorsPanel />} />
        <Route path="pages" element={<PagesPanel />} />
        <Route path="notes" element={<NotesPanel />} />
        <Route path="boards" element={<BoardsPanel />} />
        <Route path="flows" element={<FlowsPanel />} />
        <Route path="toron" element={<ToronPanel />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
