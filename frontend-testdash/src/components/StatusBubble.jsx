import React from 'react';

const colorFor = (state) => {
  if (state === 'ok' || state === 'completed') return '#48bb78';
  if (state === 'running' || state === 'in_progress') return '#f6ad55';
  if (state === 'error' || state === 'failed') return '#f56565';
  return '#a0aec0';
};

export default function StatusBubble({ status }) {
  const steps = [
    { key: 'sim_batch', label: 'SIM Batch' },
    { key: 'engine_check', label: 'Engine Check' },
    { key: 'replay', label: 'Replay' },
    { key: 'load_test', label: 'Load Test' },
  ];

  const data = status?.steps || {};

  return (
    <div className="status-bubbles" aria-label="Status bubbles">
      {steps.map((step) => {
        const state = data[step.key] || 'pending';
        return (
          <div key={step.key} className="status-bubble" aria-label={`${step.label} status ${state}`}>
            <span className="dot" style={{ background: colorFor(state) }} />
            <span>{step.label}</span>
            <span className={`badge ${state === 'failed' || state === 'error' ? 'err' : state === 'running' ? 'warn' : 'ok'}`}>
              {state}
            </span>
          </div>
        );
      })}
    </div>
  );
}
