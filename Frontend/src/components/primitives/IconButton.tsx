import React from 'react';
const IconButton: React.FC<{ label: string; onClick: (e: React.MouseEvent<HTMLButtonElement>)=>void; children: React.ReactNode }>=({label,onClick,children})=> (
  <button onClick={onClick} className="p-1 rounded card-token" title={label} aria-label={label}>{children}</button>
);
export default IconButton;
