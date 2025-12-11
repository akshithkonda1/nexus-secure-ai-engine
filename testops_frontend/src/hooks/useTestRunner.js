import { useCallback, useState } from 'react'
import { runAllTests, fetchStatus, fetchResult } from '../api/testAPI'

export default function useTestRunner() {
  const [runId, setRunId] = useState('')
  const [status, setStatus] = useState(null)
  const [result, setResult] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)

  const start = useCallback(async () => {
    setLoading(true)
    const resp = await runAllTests()
    setRunId(resp.run_id)
    setStatus({ state: 'running', run_id: resp.run_id })
    return resp.run_id
  }, [])

  const refresh = useCallback(async (id) => {
    if (!id) return null
    const data = await fetchStatus(id)
    setStatus(data)
    return data
  }, [])

  const loadResult = useCallback(async (id) => {
    if (!id) return null
    const data = await fetchResult(id)
    setResult(data)
    return data
  }, [])

  const addLog = useCallback((line) => {
    setLogs((prev) => [...prev, line])
  }, [])

  const reset = useCallback(() => {
    setRunId('')
    setStatus(null)
    setResult(null)
    setLogs([])
    setLoading(false)
  }, [])

  return { runId, status, result, logs, loading, start, refresh, loadResult, addLog, reset, setLoading }
}
