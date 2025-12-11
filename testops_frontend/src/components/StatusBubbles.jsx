import React from 'react'

const bubbles = [
  { key: 'sim', label: 'SIM Batch' },
  { key: 'engine', label: 'Engine Check' },
  { key: 'replay', label: 'Replay' },
  { key: 'load', label: 'Load Test' }
]

function bubbleClass(status) {
  if (!status) return 'idle'
  if (status.status === 'failed') return 'error'
  if (status.status === 'completed') return 'done'
  return 'running'
}

export default function StatusBubbles({ status }) {
  const cls = bubbleClass(status)
  return (
    <div className="bubble-row">
      {bubbles.map((bubble) => (
        <div key={bubble.key} className={`bubble ${cls}`}>
          {bubble.label}
        </div>
      ))}
    </div>
  )
}
