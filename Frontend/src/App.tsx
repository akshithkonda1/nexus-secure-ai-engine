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
  console.log("Ryuzen App Mounted");
  return <RootLayout />;
}

export default App;
