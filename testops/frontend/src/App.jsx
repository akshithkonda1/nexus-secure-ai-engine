import React from 'react';
import TestDashboard from './pages/TestDashboard.jsx';

const App = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Ryuzen TestOps - Section 1</h1>
        <p className="subheading">Backend & Frontend bootstrap with live telemetry</p>
      </header>
      <main>
        <TestDashboard />
      </main>
    </div>
  );
};

export default App;
