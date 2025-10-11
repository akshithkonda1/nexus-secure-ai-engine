import React from 'react';
const TabButton: React.FC<{ active: boolean; label: string; onClick: ()=>void }>=({active,label,onClick})=> (
  <button onClick={onClick} className={`px-2 py-1 rounded ${active?'bg-[rgb(var(--ring))] text-white':'card-token'}`}>{label}</button>
);
export default TabButton;
