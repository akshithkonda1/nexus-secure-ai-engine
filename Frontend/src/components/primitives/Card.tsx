import React from 'react';
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`chatgpt-card ${className||''}`}>{children}</div>
);
export default Card;
