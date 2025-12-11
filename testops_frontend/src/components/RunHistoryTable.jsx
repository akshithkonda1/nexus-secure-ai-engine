import React, { useEffect, useState } from 'react'

export default function RunHistoryTable() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    fetch('/tests/history')
      .then((r) => r.json())
      .then(setRows)
      .catch(() => setRows([]))
  }, [])

  return (
    <table className="history">
      <thead>
        <tr>
          <th>Run ID</th>
          <th>Status</th>
          <th>Summary</th>
          <th>Created</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.run_id}>
            <td>{row.run_id}</td>
            <td>{row.status}</td>
            <td>{row.summary}</td>
            <td>{row.created_at}</td>
            <td>{row.updated_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
