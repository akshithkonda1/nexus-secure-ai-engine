import React from 'react';
const TabButton: React.FC<{ active: boolean; label: string; onClick: ()=>void }>=({active,label,onClick})=> (
  <button onClick={onClick} className={`chatgpt-sidebar-tab ${active?'is-active':''}`} role="tab" aria-selected={active}>{label}</button>
);
export default TabButton;
