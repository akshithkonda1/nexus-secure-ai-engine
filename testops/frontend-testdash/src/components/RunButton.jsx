import React, { useState } from 'react';

function RunButton({ onRun, disabled }) {
  const [phrase, setPhrase] = useState('');
  const unlocked = phrase === 'Begin testing';

  const handleClick = async () => {
    if (disabled || !unlocked) return;
    await onRun(phrase);
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Type \"Begin testing\" to unlock"
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
        style={{ padding: '8px', minWidth: '220px' }}
      />
      <button className="btn" onClick={handleClick} disabled={disabled || !unlocked}>
        RUN FULL TEST SUITE
      </button>
    </div>
  );
}

export default RunButton;
