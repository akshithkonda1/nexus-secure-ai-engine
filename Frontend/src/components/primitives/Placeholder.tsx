import React from 'react';
const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <div className="chatgpt-placeholder">{label}</div>
);
export default Placeholder;
