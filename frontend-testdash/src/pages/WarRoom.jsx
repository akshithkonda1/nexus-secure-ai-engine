import React, { useEffect, useState } from 'react';
import ErrorList from '../components/ErrorList';

export default function WarRoom() {
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    // Pull errors from war room logs if available
    async function loadErrors() {
      try {
        const res = await fetch('/backend/warroom/master/index.json');
        if (res.ok) {
          const data = await res.json();
          const sorted = [...data.errors].sort((a, b) => {
            const sevOrder = { critical: 0, high: 1, warning: 2, info: 3 };
            const aSev = sevOrder[a.severity] ?? 4;
            const bSev = sevOrder[b.severity] ?? 4;
            if (aSev !== bSev) return aSev - bSev;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });
          setErrors(sorted);
        }
      } catch (e) {
        setErrors([
          {
            severity: 'info',
            timestamp: new Date().toISOString(),
            message: 'War room index not available; waiting for next run.',
          },
        ]);
      }
    }
    loadErrors();
  }, []);

  return (
    <div>
      <h2>War Room</h2>
      <p>All logged errors sorted by severity and timestamp for rapid triage.</p>
      <ErrorList errors={errors} />
    </div>
  );
}
