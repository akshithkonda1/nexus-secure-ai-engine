import { useEffect } from 'react'

export default function useEventStream(runId, onMessage) {
  useEffect(() => {
    if (!runId) return
    const source = new EventSource(`/tests/stream/${runId}`)
    source.onmessage = (event) => {
      if (onMessage) {
        onMessage(event.data)
      }
    }
    return () => source.close()
  }, [runId, onMessage])
}
