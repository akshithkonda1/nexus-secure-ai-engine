import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BeginTesting from './pages/BeginTesting.jsx';
import TestDashboard from './pages/TestDashboard.jsx';
import TestRunDetails from './pages/TestRunDetails.jsx';
import ReportViewer from './pages/ReportViewer.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BeginTesting />} />
      <Route path="/dashboard" element={<TestDashboard />} />
      <Route path="/run/:runId" element={<TestRunDetails />} />
      <Route path="/report/:runId" element={<ReportViewer />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
