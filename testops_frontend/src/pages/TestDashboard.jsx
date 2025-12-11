import React, { useEffect, useMemo, useState } from 'react'
import TestRunButton from '../components/TestRunButton'
import StatusBubbles from '../components/StatusBubbles'
import LiveLogStream from '../components/LiveLogStream'
import TestResultSummary from '../components/TestResultSummary'
import RunHistoryTable from '../components/RunHistoryTable'
import useTestRunner from '../hooks/useTestRunner'
import useEventStream from '../hooks/useEventStream'
import { fetchReport, fetchBundle } from '../api/testAPI'

export default function TestDashboard() {
  const runner = useTestRunner()
  const [unlockText, setUnlockText] = useState('')
  const [progress, setProgress] = useState(0)

  useEventStream(runner.runId, (line) => {
    runner.addLog(line)
    setProgress((prev) => Math.min(100, prev + 5))
  })

  useEffect(() => {
    if (runner.status?.status === 'completed') setProgress(100)
  }, [runner.status])

  const unlocked = unlockText.trim() === 'BEGIN TESTING'

  const startRun = async () => {
    const id = await runner.start()
    const poll = setInterval(async () => {
      const status = await runner.refresh(id)
      if (status.status === 'completed' || status.status === 'failed') {
        clearInterval(poll)
        await runner.loadResult(id)
        runner.setLoading(false)
      }
    }, 500)
  }

  const reportLink = useMemo(() => (runner.runId ? `/tests/report/${runner.runId}` : '#'), [runner.runId])

  return (
    <div className="card">
      <div className="controls-row">
        <div className="unlock">
          <label>Type BEGIN TESTING to unlock</label>
          <input
            value={unlockText}
            onChange={(e) => setUnlockText(e.target.value)}
            placeholder="BEGIN TESTING"
          />
        </div>
        <TestRunButton disabled={!unlocked || runner.loading} onClick={startRun} />
        <div className="progress">
          <div className="bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <StatusBubbles status={runner.status} />
      <LiveLogStream logs={runner.logs} />
      <TestResultSummary result={runner.result} />
      <div className="report-actions">
        <a className="pill" href={reportLink} target="_blank" rel="noreferrer">View Report</a>
        <button className="pill" onClick={() => runner.runId && window.open(`/tests/bundle/${runner.runId}`)}>Download Pack</button>
        <button className="pill" onClick={() => runner.runId && window.open(`/tests/result/${runner.runId}`)}>View Snapshot</button>
      </div>
      <RunHistoryTable />
    </div>
  )
}
