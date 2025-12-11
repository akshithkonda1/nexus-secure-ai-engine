import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTestRunner from '../hooks/useTestRunner.js';
import HeaderBar from '../components/HeaderBar.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';

function BeginTesting() {
  const navigate = useNavigate();
  const { actions, loading } = useTestRunner();
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (phrase.trim().toLowerCase() !== 'begin testing') {
      setError('Type the phrase exactly to enter the dashboard.');
      return;
    }
    try {
      await actions.begin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to validate engine health.');
    }
  };

  return (
    <div className="app-shell">
      <HeaderBar />
      <div className="panel">
        <h2 className="section-title">Begin Testing</h2>
        <p style={{ color: 'var(--muted)' }}>
          This console is restricted. Confirm readiness by typing the passphrase below and we
          will validate engine health before proceeding.
        </p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
          <label>
            Passphrase
            <input
              className="input-field"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              placeholder="begin testing"
            />
          </label>
          {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
          <button className="btn" type="submit">
            Validate &amp; Enter
          </button>
        </form>
      </div>
      {loading && <LoadingOverlay message="Validating engine health" />}
    </div>
  );
}

export default BeginTesting;
