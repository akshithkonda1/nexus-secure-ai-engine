import React from 'react';
const IconButton: React.FC<{ label: string; onClick: (e: React.MouseEvent<HTMLButtonElement>)=>void; children: React.ReactNode }>=({label,onClick,children})=> (
  <button onClick={onClick} className="chatgpt-icon-button" title={label} aria-label={label}>{children}</button>
);
export default IconButton;
