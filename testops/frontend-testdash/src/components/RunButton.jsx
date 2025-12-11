import React from 'react';

function RunButton({ onRun, disabled }) {
  const handleClick = async () => {
    if (disabled) return;
    await onRun();
  };

  return (
    <button className="btn" onClick={handleClick} disabled={disabled}>
      RUN FULL TEST SUITE
    </button>
  );
}

export default RunButton;
