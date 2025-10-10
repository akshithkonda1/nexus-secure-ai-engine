import React from 'react';
const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <div className="rounded-xl border border-dashed p-6 text-sm text-center" style={{ borderColor: 'rgb(var(--border))', color: 'rgba(0,0,0,.5)' }}>{label}</div>
);
export default Placeholder;
