import React from 'react'
import RunHistoryTable from '../components/RunHistoryTable'

export default function RunHistory() {
  return (
    <div className="card">
      <h2>Run History</h2>
      <p>Recent runs stored in SQLite for auditability.</p>
      <RunHistoryTable />
    </div>
  )
}
