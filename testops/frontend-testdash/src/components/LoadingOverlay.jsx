import React from 'react';

function LoadingOverlay({ message }) {
  return <div className="loading-overlay">{message || 'Working…'}</div>;
}

export default LoadingOverlay;
