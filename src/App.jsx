import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import TestDashboard from './pages/TestDashboard.jsx';

const App = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 20% 20%, rgba(111,124,255,0.18), transparent 30%), radial-gradient(circle at 80% 10%, rgba(66,255,179,0.12), transparent 28%), linear-gradient(135deg, #0a0f1f 0%, #0a1024 50%, #0a0f1f 100%)',
        color: 'var(--text)',
        padding: '28px 32px 60px',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, letterSpacing: '0.08em', fontSize: 24 }} className="neon-text">
            Ryuzen TestOps v1.0
          </h1>
          <p style={{ margin: '6px 0 0', opacity: 0.85 }}>Internal Epistemic Engine Validation Suite</p>
        </div>
        <div
          className="glass-panel"
          style={{
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'linear-gradient(120deg, rgba(111,124,255,0.15), rgba(255,255,255,0.04))',
            borderRadius: 12,
            border: '1px solid rgba(111,124,255,0.25)',
            boxShadow: '0 0 18px rgba(111,124,255,0.25)',
          }}
        >
          <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--info)' }}>
            mission control
          </span>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
        </div>
      </header>

      <HashRouter>
        <Routes>
          <Route path="/" element={<TestDashboard />} />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
