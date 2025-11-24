import { Route, Routes } from "react-router-dom";

import RootLayout from "@/layouts/RootLayout";
import Documents from "@/pages/Documents";
import FeedbackDashboard from "@/pages/FeedbackDashboard";
import History from "@/pages/History";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import Toron from "@/pages/Toron";
import Workspace from "@/pages/Workspace";

export function App() {
  console.log("Ryuzen App Mounted");
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="toron" element={<Toron />} />
        <Route path="workspace" element={<Workspace />} />
        <Route path="documents" element={<Documents />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
        <Route path="feedback-dashboard" element={<FeedbackDashboard />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
