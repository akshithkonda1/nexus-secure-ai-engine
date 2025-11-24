import { Route, Routes } from "react-router-dom";

import RootLayout from "@/layouts/RootLayout";
import Documents from "@/pages/Documents";
import History from "@/pages/History";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Settings from "@/pages/Settings";
import Toron from "@/pages/Toron";
import Workspace from "@/pages/Workspace";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="toron" element={<Toron />} />
        <Route path="workspace" element={<Workspace />} />
        <Route path="documents" element={<Documents />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
