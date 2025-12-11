import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import TestDashboard from './pages/TestDashboard.jsx';
import RunHistory from './pages/RunHistory.jsx';
import ReportViewer from './pages/ReportViewer.jsx';

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 18px',
  background: '#0f172a',
  borderBottom: '1px solid #1f2937'
};

const linkStyle = {
  color: '#cbd5e1',
  marginRight: '12px',
  textDecoration: 'none',
  fontWeight: 600,
  padding: '8px 12px',
  borderRadius: '8px'
};

const activeStyle = {
  ...linkStyle,
  background: '#1e293b',
  color: '#7dd3fc'
};

const shellStyle = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at 20% 20%, rgba(125, 211, 252, 0.08), transparent 35%), #0b0d12',
  color: '#e5e7eb'
};

const contentStyle = {
  padding: '20px',
  maxWidth: '1200px',
  margin: '0 auto'
};

const App = () => {
  return (
    <div style={shellStyle}>
      <nav style={navStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#e2e8f0' }}>
          <span style={{ color: '#7dd3fc' }}>Ryuzen</span> TestOps v2.5H+
        </div>
        <div>
          <NavLink to="/" end style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
            Dashboard
          </NavLink>
          <NavLink to="/history" style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
            Run History
          </NavLink>
          <NavLink to="/report/latest" style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
            Report
          </NavLink>
        </div>
      </nav>
      <main style={contentStyle}>
        <Routes>
          <Route path="/" element={<TestDashboard />} />
          <Route path="/history" element={<RunHistory />} />
          <Route path="/report/:runId" element={<ReportViewer />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
