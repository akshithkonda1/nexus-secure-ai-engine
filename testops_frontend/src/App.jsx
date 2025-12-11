import React from 'react'
import TestDashboard from './pages/TestDashboard'
import RunHistory from './pages/RunHistory'
import ReportViewer from './pages/ReportViewer'
import './styles/dashboard.css'

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="badge">Ryuzen Toron v2.5H+</p>
          <h1>TestOps DevOps Suite</h1>
        </div>
        <div className="actions">
          <a className="pill" href="#dashboard">Dashboard</a>
          <a className="pill" href="#history">History</a>
          <a className="pill" href="#report">Reports</a>
        </div>
      </header>
      <main>
        <section id="dashboard">
          <TestDashboard />
        </section>
        <section id="history">
          <RunHistory />
        </section>
        <section id="report">
          <ReportViewer />
        </section>
      </main>
    </div>
  )
}

export default App
