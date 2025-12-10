import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import TestDashboard from "./pages/TestDashboard.jsx";
import RunDetails from "./pages/RunDetails.jsx";
import History from "./pages/History.jsx";
import WarRoom from "./pages/WarRoom.jsx";
import "./styles/base.css";

function AppShell() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div className="brand">Ryuzen TestOps</div>
          <nav>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/history">History</NavLink>
            <NavLink to="/warroom">War Room</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<TestDashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/warroom" element={<WarRoom />} />
            <Route path="/runs/:runId" element={<RunDetails />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>
);
