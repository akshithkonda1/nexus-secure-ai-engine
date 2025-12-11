import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import TestDashboard from './pages/TestDashboard.jsx';
import RunDetails from './pages/RunDetails.jsx';
import History from './pages/History.jsx';
import WarRoom from './pages/WarRoom.jsx';
import './styles/base.css';

function AppShell() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <div>
            <h1>Ryuzen TestOps</h1>
            <p className="subtitle">Toron v2.5H+ Internal Test Operations Suite</p>
          </div>
          <nav aria-label="Primary">
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/history">History</NavLink>
            <NavLink to="/war-room">War Room</NavLink>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<TestDashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/war-room" element={<WarRoom />} />
            <Route path="/runs/:runId" element={<RunDetails />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<AppShell />);
