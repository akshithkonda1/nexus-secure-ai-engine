import React from 'react';
const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`card-token rounded-2xl p-4 ${className||''}`}>{children}</div>
);
export default Card;
