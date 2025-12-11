import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { engineHealth } from '../api/testAPI';

export default function BeginTesting() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async (event) => {
    event.preventDefault();
    const normalized = input.toLowerCase().trim();
    if (normalized !== 'begin testing') {
      setStatus({ ok: false, message: 'Type "Begin testing" to continue.' });
      return;
    }

    setLoading(true);
    try {
      const health = await engineHealth();
      if (health.status === 'ok') {
        setStatus({ ok: true, message: 'Engine validated. Launching dashboard…' });
        navigate('/dashboard');
      } else {
        setStatus({ ok: false, message: health.error || 'Engine validation failed.' });
      }
    } catch (error) {
      setStatus({ ok: false, message: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="testdash-root">
      <section className="gate">
        <h1>Begin Testing</h1>
        <p>
          Confirm launch phrase and run the Toron v2.5H+ engine health handshake before entering the TestOps
          dashboard.
        </p>
        <form onSubmit={handleStart} className="gate-form">
          <label htmlFor="begin-input">Type "Begin testing" to unlock</label>
          <input
            id="begin-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Begin testing"
            aria-required="true"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Checking engine…' : 'Begin'}
          </button>
        </form>
        {status && (
          <p className={status.ok ? 'ok' : 'error'} role="status">
            {status.ok ? '✅' : '❌'} {status.message}
          </p>
        )}
      </section>
    </div>
  );
}
